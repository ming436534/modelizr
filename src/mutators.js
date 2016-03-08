import { normalize, arrayOf } from './normalize'
import mock from './mock'
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
    }
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

const mockMutators = {
    then: response => cb => {
        const promise = new Promise((resolve, reject) => {
            if (response.mockError) {
                return reject(new Error('Mocked Error'))
            }
            return resolve(response())
        })

        return promise.then(cb)
    },

    normalize: response => cb => {
        const promise = new Promise((resolve, reject) => {
            if (response.mockError) {
                return reject(new Error('Mocked Error'))
            }
            return resolve(response())
        })

        return promise.then(res => normalize(
            res,
            ...response.query
        )).then(cb)
    }
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

    then: response => cb => {
        const promise = response()
        return promise.then(cb)
    },

    normalize: response => cb => {
        const promise = response()
        return promise.then(res => {
            if (res.json) {
                return normalize(
                    res.json,
                    ...response.query
                )

            }
            return res.json()
        }).then(res => {
            if (res.json) {
                return normalize(
                    res.json,
                    ...response.query
                )
            }
            return res
        }).then(cb)
    },

    mock: response => statement => statement ? mock(response.query) : response,

    setSpaces: response => spaces => {
        response.spaces = spaces
        return response
    }
}

export { sharedMutators, schemaMutators, modelMutators, queryMutators, mutationMutators, mockMutators }