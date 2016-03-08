import { applyMutators, makeQuery, _, api } from './utils'

let query = (...models) => {
    const response = onlyQuery => {
        const query = `{${_.mapValid(models, model => makeQuery(model(), response.spaces))}\n}`

        if (onlyQuery) {
            return query
        }
        return response.api(response._path, query, response.headers)
    }

    response.query = models
    response.spaces = query.spaces || 3
    response.api = query.api || api
    response._path = query._path || 'http://localhost'

    return applyMutators(response, 'query')
}

query = applyMutators(query, 'query')

export { query as default, query }