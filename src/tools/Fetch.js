// @flow
import { normalizeFunctionParameters } from './Filters'
import generate from '../core/QueryGeneration'
import Normalizr from '../data/Normalization'
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
    generate: RequestFunction,
    then: (cb: Function) => Promise<RequestResponse>,
    normalize: (cb: Function) => Promise<RequestResponse>,
}

export const FETCH_API = (config: ConfigType) => {
    const method: string = (config.method || "POST").toUpperCase()
    let server_response

    return fetch(config.endpoint, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZmZmUwYWY4LTlkNjktNDdmMy1iMjZiLTQ1ZjAzYTRkYmEyMCIsImlhdCI6MTQ3ODQ0NTQxMn0.mo4iLAjO0K0UnAUBTIoh332rJft8bARhLl9gwCb0oP0",
            ...config.headers
        },
        method,
        ...(method != "GET" && method != "HEAD" ? {
            body: JSON.stringify(config.body)
        } : {})
    })
        .then(res => {
            server_response = res
            return res.json()
        })
        .then(res => ({
            response: server_response,
            ...res
        }))
}

export const RequestBuilder = (ClientState: ClientStateType,
                               queryType: string) => (queryName: String | Object,
                                                      queryParams: Object,
                                                      ...queryModels: Array<Object>): RequestObject => {
    const {name, params, models} = normalizeFunctionParameters(queryName, queryParams, queryModels)

    const query: string = generate({ClientState, queryModels: models, queryType, queryName: name, queryParams: params})
    const config: ConfigType = {
        ...ClientState.config,
        body: queryType == 'fetch' ? {} : {query}
    }

    const normalize = res => Normalizr({
        Data: res,
        ModelFunctions: models,
        ClientState
    })

    // eslint-disable-next-line prefer-const
    let REQUEST: RequestObject
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

    REQUEST = {
        api: setConfig("api", false),
        endpoint: setConfig("endpoint", false),
        headers: headers => setConfig("endpoint", false)({...config.headers, ...headers}),
        method: setConfig("method", "POST"),
        mock: setConfig("mock", true),
        debug: setConfig("debug", true),
        body: setConfig("body", {}),

        generate(cb) {
            if (typeof cb !== 'function') throw new Error("A function needs to be provided when calling .generate")
            cb(query)
            return REQUEST
        },

        then(cb) {
            return config.api(config)
                .then(res => cb(res, normalize))
        },
        normalize(cb) {
            return REQUEST.then((res, normalize) => cb({
                ...res,
                ...normalize(res.data)
            }))
        }
    }

    return REQUEST
}
