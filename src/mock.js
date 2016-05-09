import { _, base } from './utils'

let jsf = () => ({})
if (!process.env.MODELIZR_CHEAP_MOCK) {
    jsf = require('json-schema-faker')
}

const mock = base()
mock.Class = class extends mock.Class {

    response() {
        const cache = {}

        const mock = models => _.extractMockedObjects(_.mapValid(models, model => {
            if (typeof model.build === 'function') {
                model = model.build()
            }
            model._modelType = model._modelType || 'arrayOf'

            const primary = model.primaryKey || 'id'
            const response = {}

            const newId = _.size(cache[model.name]) + 1
            let id = model._modelType == 'arrayOf' || model._modelType == 'valuesOf' ? _.range(newId, newId + 20) : newId
            if (model.params) {
                if (model.params[primary]) {
                    id = model.params[primary]
                }
            }

            const getFromCache = id => {
                const mergeNested = mockedModel => ({
                    ...mockedModel,
                    ...mock(_.map(_.filter(model.properties, prop => prop._isModel), childModel => {
                        childModel._modelType = model._mockTypes[childModel.key] || 'arrayOf'
                        return childModel
                    }))
                })

                if (cache[model.name] && cache[model.name][id]) {
                    return mergeNested(cache[model.name][id])
                }
                const mocked = _.set(jsf(model), primary, id)

                cache[model.name] = {...cache[model.name], [id]: mocked}
                return mergeNested(mocked)
            }

            if (Array.isArray(id)) {
                response[model.key] = _.map(id, id => getFromCache(id))
                if (model._modelType == 'valuesOf') {
                    response[model.key] = _.mapKeys(response[model.key], entity => entity[primary])
                }
            } else if (typeof id === 'number') {
                response[model.key] = getFromCache(id)
            } else {
                response[model.key] = getFromCache(1)
            }

            return response
        }))

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._error) {
                    if (this._error == 'throw') {
                        reject(new Error('Mocked Error'))
                    } else {
                        resolve({
                            status: this._error,
                            body: {}
                        })
                    }
                } else {
                    resolve({
                        status: 200,
                        body: mock(...this._models)
                    })
                }
            }, this._mockDelay)
        })
    }
}

export { mock as default, mock }