import { _, base } from './utils'

let jsf = () => ({})
if (!process.env.MODELIZR_CHEAP_MOCK) {
    jsf = require('json-schema-faker')
}

const mock = base()
mock.Class = class extends mock.Class {

    response() {
        const cache = {}
        const opts = {
            extensions: {},
            formats: {},
            jsfOptions: {},
            quantity: 20,
            ...this.valueOf('mockConfig')
        }

        _.forEach(opts.extensions, (extension, name) => {
            jsf.extend(name, extension)
        })
        _.forEach(opts.formats, (format, name) => {
            jsf.format(name, format)
        })
        // jsf.option(opts.jsfOptions) // Specified in json-schema-faker docs, but not actually a property of jsf. https://github.com/json-schema-faker/json-schema-faker/issues/155

        const mock = models => _.extractMockedObjects(_.mapValid(models, model => {
            if (typeof model.build === 'function') {
                model = model.build()
            }

            model._modelType = model._modelType || 'arrayOf'

            const primary = model.primaryKey || 'id'
            const response = {}

            const newId = _.size(cache[model.key]) + 1
            let id = newId

            if (model._modelType == 'arrayOf' || model._modelType == 'valuesOf') {
                id = _.range(newId, newId + opts.quantity)
            }

            if (model.params) {
                if (model.params[primary]) {
                    id = model.params[primary]
                }
            }

            const getFromCache = id => {
                let _model = model
                let schemaAttribute = model.schemaAttribute

                /**
                 * If model is a union, pick a random model from the unions collection
                 */
                if (model._isUnion) {
                    const getSchema = model => {
                        const rand = models => {
                            let result
                            let count = 0

                            for (const prop in models) {
                                if (Math.random() < 1 / ++count) {
                                    result = models[prop]
                                }
                            }

                            return result
                        }

                        if (_.size(model.properties)) return rand(model.properties)
                        return rand(model.models).schema
                    }

                    _model = {
                        type: 'object',
                        ...getSchema(model)
                    }
                    _model.model = () => _model.model
                }

                /**
                 * Find nested models and mock them
                 */
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

                /**
                 * Determine if a model with the same PK is in the cache. Use it if it is.
                 */
                const _key = model._isUnion ? model.key : _model.key
                if (cache[_key] && cache[_key][id]) {
                    return mergeNested({
                        ...cache[_key][id],
                        ...(model._isUnion ? {
                            [schemaAttribute]: _model.key
                        } : {})
                    })
                }

                let mocked = _.set(jsf(_model), primary, id)
                if (model._isUnion) mocked = _.set(mocked, schemaAttribute, _model.key)

                cache[_key] = {...cache[_key], [id]: mocked}
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
                const error = this.valueOf('mockError')
                if (error) {
                    if (error == 'throw') {
                        reject(new Error('Mocked Error'))
                    } else {
                        resolve({
                            status: error,
                            body: {}
                        })
                    }
                } else {
                    resolve({
                        status: 200,
                        body: mock(...this._models)
                    })
                }
            }, this.valueOf('mockDelay'))
        })
    }
}

export { mock as default, mock }