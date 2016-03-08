import { applyMutators, _, api } from './utils'

let jsf = () => ({})
if (!process.env.MODELIZR_CHEAP_MOCK) {
    jsf = require('json-schema-faker')
}

const mock = (...models) => {
    const response = () => {

        const cache = {}

        const mock = models => _.extractMockedObjects(_.mapValid(models, model => {
                if (typeof model === 'function') {
                    model = model()
                }

                const response = {}

                const newId = _.size(cache[model.name]) + 1
                let id = _.range(newId, newId + 20)
                if (model.params) {
                    if (model.params.id || model.params.ids) {
                        id = model.params.id || model.params.ids
                    }
                }

                const getFromCache = id => {
                    const mergeNested = mockedModel => ({
                        ...mockedModel,
                        ...mock(_.filter(model.properties, prop => prop.model))
                    })

                    if (cache[model.name] && cache[model.name][id]) {
                        return mergeNested(cache[model.name][id])
                    }
                    const mocked = _.set(jsf(model), 'id', id)

                    cache[model.name] = {...cache[model.name], [id]: mocked}
                    return mergeNested(mocked)
                }

                if (Array.isArray(id)) {
                    response[model.key] = _.map(id, id => getFromCache(id))
                } else if (typeof id === 'number') {
                    response[model.key] = getFromCache(id)
                } else {
                    response[model.key] = getFromCache(1)
                }

                return response
            }))

        return mock(models)
    }

    response.spaces = 3
    response.api = api
    response.path = 'http://localhost'

    return applyMutators(response, 'mutation')
}

export { mock as default, mock }