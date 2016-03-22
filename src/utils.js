import _ from 'lodash'
import { Base } from './base'
import { query as Query, mutation as Mutation, mock as Mock } from './index'

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

const base = mutators => {
    const res = (...models) => new res.Class(models, res._opts)
    res.Class = Base
    res._opts = {}
    res.apply = (key, value) => {
        res._opts[key] = value
        return res
    }
    res.spaces = spaces => res.apply('_spaces', spaces)
    res.api = api => res.apply('_api', api)
    res.path = path => res.apply('_path', path)
    res.headers = headers => res.apply('_headers', headers)
    res.debug = debug => res.apply('_debug', debug !== false ? true : false)
    res.mock = mock => res.apply('_mock', mock !== false ? true : false)

    _.forEach(mutators, (mutator, key) => res[key] = mutator(res))

    return res
}

const prepare = mutators => {
    const apply = (obj, target) => {
        _.forEach(obj._opts, (val, key) => {
            key = key.replace('_', '')
            typeof target[key] == 'function' ? target = target[key](val) : null
        })

        return target
    }

    return base({
        query: obj => () => {
            let query = Query
            return apply(obj, query)
        },

        mutation: obj => () => {
            let mutation = Mutation
            return apply(obj, mutation)
        },

        getMock: obj => () => {
            let mock = Mock
            return apply(obj, mock)
        },

        ...mutators || {}
    })
}

const api = (path, query, headers) => fetch(path, {
    headers: {
        ...{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        ...headers || {}
    },
    method: 'POST',
    body: JSON.stringify({query: query})
}).then(res => res.json()).then(res => {
    if (res.json) {
        if (res.json.data) {
            return res.json.data
        }
        return res.json
    } else if (res.data) {
        return res.data
    }
    return res
})

export { _, base, debug, api, prepare }