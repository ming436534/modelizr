import _ from 'lodash'

const schemaMutators = {
    key: response => key => {
        response.schema = ({
            ...response.schema,
            ...{
                key: key
            }
        })

        return response
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