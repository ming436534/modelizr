import _ from 'lodash'
import { Base, mutators } from './base'
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

const debug = (log, name) => {
    if (typeof console.groupCollapsed === 'function') console.groupCollapsed(name)
    console.log(log)
    if (typeof console.groupEnd === 'function') console.groupEnd()
}

const base = custom => {
    const res = (...models) => new res.Class(models, res._opts)
    res.Class = Base
    res._opts = {}
    res.apply = (key, value) => {
        res._opts[key] = value
        return res
    }

    _.forEach({...custom, ...mutators}, (mutator, key) => res[key] = mutator)

    return res
}

const prepare = mutators => {
    const apply = (obj, target) => {
        _.forEach(obj._opts, (val, key) => {
            key = key.replace('_', '')
            typeof target[key] == 'function' ? target = target[key](val) : null
        })

        target.custom(mutators)
        return target
    }

    return base({
        query: function () {
            const query = Query
            return apply(this, query)
        },

        mutation: function () {
            const mutation = Mutation
            return apply(this, mutation)
        },

        request: function () {
            const request = Request
            return apply(this, request)
        },

        getMock: function () {
            const mock = Mock
            return apply(this, mock)
        }
    })
}

const api = (query, opts) => {
    let status = 200

    return fetch(opts.path, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': opts.contentType || 'application/json',
            ...opts.headers || {}
        },
        method: opts.method || 'POST',
        body: JSON.stringify(opts._plainReq ? query : {query})
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