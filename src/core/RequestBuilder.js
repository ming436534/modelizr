// @flow
import { normalizeFunctionParameters } from '../tools/Filters'
import { createLogger } from '../tools/logger'
import generate from '../core/QueryGeneration'
import Normalizr from '../data/Normalization'
import Mock from '../data/Mocks'
import _ from 'lodash'

import { ClientStateType, ConfigType, RequestResponse, RequestObject } from '../types'
import type { Logger } from '../tools/logger'

export default (ClientState: ClientStateType,
                queryType: string) => (queryName: String | Object,
                                       queryParams: Object,
                                       ...queryModels: Array<Object>): RequestObject => {
    const {name, params, models} = normalizeFunctionParameters(queryName, queryParams, queryModels)

    /* If debugging is enabled, create a logger instance, else
     * create a noop debugger
     * */
    const logger: Logger = ClientState.config.debug ?
        createLogger(`[${queryType}: ${_.map(models, model => model.FieldName)}`) : {
        add: () => {
        },
        print: () => {
        }
    }

    /* generate the query and add it to the request body. If the
     * requestType is 'fetch', do not mutate the body
     * */
    const query: string = generate({ClientState, queryModels: models, queryType, queryName: name, queryParams: params})
    const config: ConfigType = {
        ...ClientState.config,
        body: queryType == 'fetch' ? {} : {query}
    }

    /* Add the generated query to the debugging instance */
    if (queryType != 'fetch') logger.add("Query", query)

    /* A utility method that, when given a response - calls our internal
     * Normalize method with both the given response and the model tree.
     * */
    const normalize = (Data: Object) => Normalizr({
        Data,
        ModelFunctions: models,
        ClientState
    })

    // eslint-disable-next-line prefer-const
    let REQUEST: RequestObject

    /* A utility method that mutates config properties and returns the REQUEST object.
     * This is to allow for chaining config modifiers (.api().headers() ...)
     * */
    const setConfig: Function = _.curry((key: string, useDefault: Boolean, value: ?any): RequestObject => {
        if (!value && value !== false) {
            if (useDefault) {
                value = useDefault
            } else {
                throw new Error(`Please provide a value for the modifier '${key}()'`)
            }
        }
        config[key] = value
        return REQUEST
    })

    /* A utility method that calls the configured api and
     * adds the response to the debugger instance.
     * */
    const MAKE_REQUEST = (): Promise<RequestResponse> =>
        (config.mock ? Mock({...ClientState, config}, models) : config
            .api(config))
            .then((res) => {
                logger.add("Server Response", res.server_response || {})
                logger.add("GraphQL response", {
                    data: res.data,
                    errors: res.errors
                })

                return res
            })
            .catch(e => {
                logger.add("error", e)
                logger.print()
                throw e
            })

    /* Our request object that the user has access to. This object
     * contains all modifier methods as well the request catalysts,
     * .normalize() and .then()
     * */
    REQUEST = {
        api: setConfig("api", false),
        endpoint: setConfig("endpoint", false),
        headers: headers => setConfig("headers", false)({...config.headers, ...headers}),
        method: setConfig("method", "POST"),
        mock: setConfig("mock", true),
        debug: setConfig("debug", true),
        body: setConfig("body", {}),
        throwOnErrors: setConfig("throwOnErrors", true),

        /* give the generated query to the provided callback and return the REQUEST object */
        generate: (cb: (q: string) => any): RequestObject => {
            if (typeof cb !== 'function') throw new Error("A function needs to be provided when calling .generate")
            cb(query)
            return REQUEST
        },

        then(cb): Promise<RequestResponse> {
            return MAKE_REQUEST()
                .then(res => {
                    logger.print()
                    return cb(res, normalize)
                })
        },
        normalize(cb): Promise<RequestResponse> {
            return MAKE_REQUEST()
                .then(res => {
                    const normalizedResponse = normalize(res.data)
                    logger.add("Normalized Response", normalizedResponse)
                    logger.print()
                    return cb({
                        ...res,
                        ...normalizedResponse
                    })
                })
        }
    }

    return REQUEST
}