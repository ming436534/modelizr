// @flow
import { normalizeFunctionParameters } from './Filters'
import generate from '../core/QueryGeneration'
import Normalizr from '../data/Normalization'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

import { ClientStateType, ConfigType } from '../types'

export const FETCH_API = (config: ConfigType) => {
    const method: String = (config.method || "POST").toUpperCase()
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
            server_response = res
            return res.json()
        })
        .then(res => ({
            response: server_response,
            ...res
        }))
}

export const RequestBuilder = (ClientState: ClientStateType,
                               queryType: String) => (queryName, queryParams, ...queryModels) => {
    const {name, params, models} = normalizeFunctionParameters(queryName, queryParams, queryModels)

    const query: String = generate({ClientState, queryModels: models, queryType, queryName: name, queryParams: params})
    const config: ConfigType = {
        ...ClientState.config,
        body: queryType == 'fetch' ? {} : {query}
    }

    const normalize = res => Normalizr({
        Data: res,
        ModelFunctions: models,
        ClientState
    })

    let REQUEST = {}
    const setConfig: Function = _.curry((key: String, useDefault: Boolean, value: ?any): REQUEST => {
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
            config.api(config)
                .then(res => cb(res, normalize))
        },
        normalize(cb) {
            REQUEST.then((res, normalize) => cb({
                ...res,
                ...normalize(res.data)
            }))
        }
    }

    return REQUEST
}
