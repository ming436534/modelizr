import { applyMutators, spacer, makeParams, makeQuery, _, api } from './utils'

const mutation = (...models) => {
    const response = pure => {
        let query = `mutation ${response.mutationName || 'query'} {${_.mapValid(models, model => {
            if (model.query) {
                return makeQuery(model(), response.spaces)
            }
            return `\n${spacer(response.spaces)}${model().key}${makeParams(model().params)}`
        })}\n}`

        if (pure) {
            return query
        }
        return response.api(response.path, query)
    }

    response.spaces = 3
    response.api = api
    response.path = 'http://localhost'

    return applyMutators(response, 'mutation')
}

export { mutation as default, mutation }