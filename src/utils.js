import _ from 'lodash'
import { Base } from './base'

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

const prepare = () => {
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

    return res
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
})

export { _, prepare, debug, api }