import { arrayOf } from './normalize'
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

    withQuery: response => () => {
        response.query = true
        return response
    },

    onlyIf: response => statement => {
        if (!statement) {
            response.construct.continue = false
        }

        return response
    }
}

const queryMutators = {

}

const mutationMutators = {
    as: response => name => {
        response.mutationName = name
        return response
    }
}

const sharedMutators = {
    getQuery: response => () => response(true)
}

export { sharedMutators, schemaMutators, modelMutators, queryMutators, mutationMutators }