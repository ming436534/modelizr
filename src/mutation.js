import { applyMutators, spacer, makeParams, makeQuery, _, api } from './utils'

let mutation = (...models) => {
    const response = onlyQuery => {
        const query = `mutation ${response.mutationName || 'query'} {${_.mapValid(models, model => {
            if (response.includeQuery) {
                return makeQuery(model(), response.spaces)
            }
            return `\n${spacer(response.spaces)}${model().key}${makeParams(model().params)}`
        })}\n}`

        if (onlyQuery) {
            return query
        }
        if (response._debug) {
            console.log(query)
        }
        return response.api(response._path, query, response.headers)
    }

    response.query = models
    response.spaces = mutation.spaces || 3
    response.api = mutation.api || api
    response._path = mutation._path || 'http://localhost'
    response._debug = mutation._debug || false

    return applyMutators(response, 'mutation')
}

mutation = applyMutators(mutation, 'mutation')

export { mutation as default, mutation }