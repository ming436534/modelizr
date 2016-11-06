// @flow
import { normalizeFunctionParameters } from './Filters'
import generate from '../core/QueryGeneration'
import Normalizr from '../data/Normalization'
import { GraphQLError } from './Collections'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

import { ClientStateType, ConfigType } from '../types'

type RequestFunction = (value: any) => RequestObject

type RequestResponse = {
    response: Object,
    data: Object,
    errors: Object,
    entities: ?Object,
    result: ?Object
}

type RequestObject = {
    api: RequestFunction,
    endpoint: RequestFunction,
    headers: RequestFunction,
    method: RequestFunction,
    mock: RequestFunction,
    debug: RequestFunction,
    body: RequestFunction,
    throwOnErrors: RequestFunction,
    generate: RequestFunction,
    then: (cb: Function) => Promise<RequestResponse>,
    normalize: (cb: Function) => Promise<RequestResponse>,
}

type Logger = {
    add: (key: string, value: any) => any,
    print: () => any
}

/**
 * A logger utility to help debug and follow individual requests
 *
 * @param name
 * @return {{add: (function(*, *): Number), print: (function())}}
 */
const createLogger = (name: string): Logger => {
    const group = []
    const time = Date.now()

    return {
        add: (key, value) => group.push({key, value}),
        print: () => {
            /* eslint-disable */
            if (typeof console.groupCollapsed === 'function') console.groupCollapsed(`${name} [${(Date.now() - time) / 1000}s]`)
            _.forEach(group, ({key, value}) => {
                if (typeof console.groupCollapsed === 'function') console.groupCollapsed(key)
                console.log(value)
                if (typeof console.groupEnd === 'function') console.groupEnd()
            })
            if (typeof console.groupEnd === 'function') console.groupEnd()
            /* eslint-enable */
        }
    }
}

/**
 * The fetch implementation that is used to make requests.
 *
 * It returns a promise containing a RequestResponse type object.
 * If the response from the api contains an 'errors' property,
 * a GraphQLError will be thrown. This behaviour can be disabled
 *
 * @param config
 * @return {Promise.<RequestResponse>|*|Promise.<{response: *}>}
 * @constructor
 */
export const FETCH_API = (config: ConfigType) => {
    const method: string = (config.method || "POST").toUpperCase()
    let server_response

    return fetch(config.endpoint, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...config.headers
        },
        method,
        ...(method != "GET" && method != "HEAD" ? {
            body: JSON.stringify(config.body)
        } : {})
    })
        .then(res => {
            // convert the body to json but also store the raw server response
            server_response = res
            return res.json()
        })
        .then(res => {
            // the GraphQL server responded with errors. Throw a GraphQLError.
            if (res.errors) {
                if (config.throwOnErrors) throw new GraphQLError("The request ended with errors.", res.errors)
            }

            return {
                response: server_response,
                ...res
            }
        })
}

export const RequestBuilder = (ClientState: ClientStateType,
                               queryType: string) => (queryName: String | Object,
                                                      queryParams: Object,
                                                      ...queryModels: Array<Object>): RequestObject => {
    const {name, params, models} = normalizeFunctionParameters(queryName, queryParams, queryModels)

    /**
     * If debugging is enabled, create a logger instance, else create a noop debugger
     */
    const logger: Logger = ClientState.config.debug ?
        createLogger(`[${queryType}: ${_.map(models, model => model.FieldName)}`) : {
        add: () => {
        },
        print: () => {
        }
    }

    // generate the query and add it to the request body. If the requestType is 'fetch', do not mutate the body
    const query: string = generate({ClientState, queryModels: models, queryType, queryName: name, queryParams: params})
    const config: ConfigType = {
        ...ClientState.config,
        body: queryType == 'fetch' ? {} : {query}
    }

    // Add the generated query to the debugging instance
    if (queryType != 'fetch') logger.add("query", query)

    /**
     * A utility method that, when given a response - calls our internal
     * Normalize method with both the given response and the model tree.
     *
     * @param res
     */
    const normalize = (Data: Object) => Normalizr({
        Data,
        ModelFunctions: models,
        ClientState
    })

    // eslint-disable-next-line prefer-const
    let REQUEST: RequestObject

    /**
     * A utility method that mutates config properties and returns the REQUEST object.
     *
     * This is to allow for chaining config modifiers (.api().headers() ...)
     * @returns REQUEST
     */
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

    /**
     * A utility method that calls the configured api and
     * adds the response to the debugger instance.
     *
     * @type {Promise.<T>}
     */
    const MAKE_REQUEST = config
        .api(config)
        .then(res => {
            logger.add("server_response", res.response)
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

    /**
     * Our request object that the user has access to. This object
     * contains all modifier methods as well the request catalysts,
     * .normalize() and .then()
     */
    REQUEST = {
        api: setConfig("api", false),
        endpoint: setConfig("endpoint", false),
        headers: headers => setConfig("endpoint", false)({...config.headers, ...headers}),
        method: setConfig("method", "POST"),
        mock: setConfig("mock", true),
        debug: setConfig("debug", true),
        body: setConfig("body", {}),
        throwOnErrors: setConfig("throwOnErrors", true),

        // give the generated query to the provided callback and return the REQUEST object
        generate(cb) {
            if (typeof cb !== 'function') throw new Error("A function needs to be provided when calling .generate")
            cb(query)
            return REQUEST
        },

        then(cb) {
            return MAKE_REQUEST
                .then(res => {
                    logger.print()
                    return cb(res, normalize)
                })
        },
        normalize(cb) {
            return MAKE_REQUEST
                .then((res, normalize) => {
                    const normalizedResponse = normalize(res.data)
                    logger.add("normalized response", normalizedResponse)
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
