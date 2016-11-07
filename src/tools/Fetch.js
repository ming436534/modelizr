// @flow
import { GraphQLError } from './public'
import fetch from 'isomorphic-fetch'

import { ConfigType } from '../types'

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
                server_response,
                ...res
            }
        })
}
