import _ from 'lodash'
import { QueryBase, QueryMutators } from './bases'
import { query as Query, mutation as Mutation, mock as Mock, request as Request } from './index'

_.mapValid = (array, map) => _.map(_.pickBy(array, element => element && element.continue !== false), map)
_.extractMockedObjects = array => {
    let response = {}
    _.forEach(array, element => {
        response = {
            ...response,
            ...element
        }
    })

    return response
}
_.hasValuesOf = (response, model) => {
    const filtered = _.filter(response, value => {
        return (model.required && model.required.length && _.filter(model.required, field => value[field]).length === model.required.length) || false
    })
    return filtered.length == _.size(response)
}

const debug = (log, name) => {
    if (typeof console.groupCollapsed === 'function') console.groupCollapsed(name)
    console.log(log)
    if (typeof console.groupEnd === 'function') console.groupEnd()
}

const base = custom => {
    let res = (...models) => new res.Class(models, res._mutations)
    res.Class = QueryBase
    res._mutations = {}
    res = Object.assign(res, new QueryMutators(res))

    _.forEach(custom, (mutator, key) => res[key] = mutator)

    return res
}

const prepare = mutators => {
    const apply = (obj, target) => {
        target._mutations = {
            ...obj._mutations,
            custom: mutators
        }
        return target
    }

    return base({
        query: function() {
            const query = Query
            return apply(this, query)
        },

        mutation: function() {
            const mutation = Mutation
            return apply(this, mutation)
        },

        request: function() {
            const request = Request
            return apply(this, request)
        },

        getMock: function() {
            const mock = Mock
            return apply(this, mock)
        }
    })
}

const api = (query, {path, contentType, headers, method, isPlain}) => {
    let status = 200

    return fetch(path, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': contentType || 'application/json',
            ...headers || {}
        },
        method: method || 'POST',
        body: JSON.stringify(isPlain ? query : {query})
    }).then(res => {
        status = res.status
        return res.json()
    }).then(res => {
        const response = {
            status,
            body: res
        }
        if (res.json) {
            if (res.json.data) {
                response.body = res.json.data
                return response
            }
            response.body = res.json
            return response
        } else if (res.data) {
            response.body = res.data
        }
        return response
    })
}

export { _, base, debug, api, prepare }