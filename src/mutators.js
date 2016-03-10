import { normalize, arrayOf } from './normalize'
import { applyMutators } from './utils'
import _ from 'lodash'

const schemaMutators = {
    define: response => definitions => {
        response.schema.model.define(_.mapValues(definitions, definition => {
            if (Array.isArray(definition)) {
                return arrayOf(definition[0], definition[1])
            } else if (definition.schema) {
                return definition.schema.model
            }
            return definition
        }))
    },

    getKey: response => () => response.schema.key
}

const modelMutators = {
    as: response => key => {
        response.construct = ({
            ...response.construct,
            ...{
                key: key
            }
        })

        return response
    },

    params: response => params => {
        response.construct.params = ({
            ...response.construct.params,
            ...params || undefined
        })
        return response
    },

    without: response => exclusion => {
        response.construct.properties = _.omit(response.construct.properties, exclusion)
        return response
    },

    only: response => selection => {
        response.construct.properties = _.pick(response.construct.properties, selection)
        return response
    },

    onlyIf: response => statement => {
        if (!statement) {
            response.construct.continue = false
        }

        return response
    },

    normalizeAs: response => key => {
        response.construct.model._key = key
        return response
    },

    properties: response => (props, overwrite) => {
        if (Array.isArray(props)) {
            props = _.mapValues(_.mapKeys(props, prop => prop), () => ({type: 'string'}))
        }

        if (overwrite) {
            response.construct.properties = props
        } else {
            response.construct.properties = {
                ...response.construct.properties,
                ...props
            }
        }

        return response
    }
}
modelMutators.props = modelMutators.properties

const queryMutators = {}

const mutationMutators = {
    as: response => name => {
        response.mutationName = name
        return response
    },

    withQuery: response => () => {
        response.includeQuery = true
        return response
    },
}

const mockMutators = {}

const _debug = (query, res, name) => {
    if (typeof console.group === 'function') console.groupCollapsed('Modelizr: ')
    console.log(query, res)
    if (typeof console.groupEnd === 'function') console.groupEnd()
}

const sharedMutators = {
    generate: response => () => response(true),

    useApi: response => api => {
        response.api = api
        return response
    },

    path: response => path => {
        response._path = path
        return response
    },

    headers: response => headers => {
        response.headers = headers
        return response
    },

    debug: response => debug => {
        if (debug !== false) {
            response._debug = true
        } else {
            response._debug = false
        }

        return response
    },

    then: response => cb => {
        cb = cb || function () {
            }
        const promise = response()
        return promise.then(res => {
            if (response._debug) {
                _debug(response.generate(), res, response.construct.key)
            }
            cb(res, response.query)
        })
    },

    normalize: response => cb => {
        cb = cb || function () {
            }
        const promise = response()
        const normalizeResponse = res => {
            const result = normalize(
                res,
                ...response.query
            )
            if (response._debug) {
                _debug(response.generate(), result, response.construct.key)
            }
            return result
        }

        return promise.then(res => {
            if (res.json) {
                return {
                    normalized: normalizeResponse(res.json)
                }
            }
            return res.json()
        }).then(res => {
            if (res.json) {
                return normalizeResponse(res.json)
            }
            if (res.normalized) {
                return res.normalized
            }
            if (response._debug) {
                _debug(response.generate(), res, response.construct.key)
            }
            return res
        }).then(res => cb(res, response.query))
    },

    mock: response => statement => {
        if (statement !== false) response._mock = true
        return response
    },

    setSpaces: response => spaces => {
        response.spaces = spaces
        return response
    }
}

export { sharedMutators, schemaMutators, modelMutators, queryMutators, mutationMutators, mockMutators }