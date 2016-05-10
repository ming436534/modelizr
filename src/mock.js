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

            const rand = model => {
                let result
                let count = 0
                for (const prop in model.models)
                    if (Math.random() < 1 / ++count)
                        result = model.models[prop]
                return result
            }

            model._modelType = model._modelType || 'arrayOf'

            const primary = model.primaryKey || 'id'
            const response = {}

            const newId = _.size(cache[model.name]) + 1

            let id = newId

            if (model._modelType == 'arrayOf' || model._modelType == 'valuesOf') {
                id = _.range(newId, newId + 20)
            }

            if (model.params) {
                if (model.params[primary]) {
                    id = model.params[primary]
                }
            }

            const getFromCache = id => {
                let _model = model
                let schemaAttribute = model.schemaAttribute

                if (model._isUnion) {
                    _model = {
                        ...rand(model).schema,
                        type: 'object'
                    }
                    _model.model = () => _model.model
                }

                const mergeNested = mockedModel => ({
                    ...mockedModel,
                    ...mock(_.map(_.filter(_model.properties, prop => prop._isModel || prop._isUnion), childModel => {
                        childModel._modelType = _model._mockTypes[childModel.key] || 'arrayOf'
                        return childModel
                    }))
                })

                _model.properties = _.pickBy(_.mapValues(_model.properties, (prop, key) => {
                    if (typeof prop.type === 'function') {
                        const gen = prop.type()
                        if (gen._schema.key == model.propertyOf) return undefined
                        return {...gen.build(), propertyOf: key}
                    }
                    return prop
                }), prop => prop)

                if (cache[_model.key] && cache[_model.key][id]) {
                    return mergeNested(cache[_model.key][id])
                }
                let mocked = _.set(jsf(_model), primary, id)
                if (model._isUnion) {
                    mocked = _.set(mocked, schemaAttribute, _model.key)
                }

                cache[_model.key] = {...cache[_model.key], [id]: mocked}
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