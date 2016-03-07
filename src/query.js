import { applyMutators, spacer, makeQuery, _, api } from './utils'

const query = (...models) => {
    const response = pure => {
        const query = `{${_.mapValid(models, model => makeQuery(model(), response.spaces))}\n}`

        if (pure) {
            return query
        }
        return response.api(response.path, query)
    }

    response.spaces = 3
    response.api = api
    response.path = 'http://localhost'

    return applyMutators(response, 'query')
}

export { query as default, query }