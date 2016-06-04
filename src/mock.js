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
            error: false,
            delay: 0,
            ...this.valueOf('mockConfig')
        }

        _.forEach(opts.extensions, (extension, name) => {
            jsf.extend(name, extension)
        })
        _.forEach(opts.formats, (format, name) => {
            jsf.format(name, format)
        })
        jsf.option(opts.jsfOptions)

        const mock = models => _.extractMockedObjects(_.mapValid(models, model => {
            if (typeof model.build === 'function') {
                model = model.build()
            }

            model._modelType = model._modelType || 'arrayOf'

            const primary = model.primaryKey || 'id'
            const response = {}

            const newId = _.size(cache[model.model ? model.model().getKey() : model.key]) + 1
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

                if (typeof schemaAttribute === 'function') {
                    schemaAttribute = model.mockAttribute
                }

                /**
                 * If model is a union, pick a random model from the unions collection
                 */
                if (model._isUnion) {
                    const getSchema = model => {
                        const rand = (props, models) => {
                            let result
                            let count = 0

                            for (const prop in props) {
                                if (Math.random() < 1 / ++count) {
                                    if (models) {
                                        let _k = '';
                                        result = _.find(models, (model, key) => {
                                            if (model.getKey() == props[prop].key) {
                                                _k = key
                                                return true
                                            }
                                            return false
                                        })
                                        result.schema._definedAttribute = _k
                                    } else {
                                        result = props[prop]
                                        result.schema._definedAttribute = prop
                                    }
                                }
                            }

                            return result
                        }

                        if (_.size(model.properties)) return rand(model.properties, model.models).schema
                        return rand(model.models).schema
                    }

                    _model = {
                        type: 'object',
                        ...getSchema(model)
                    }
                    if (typeof _model.model !== 'function') {
                        const _m = _model.model
                        _model.model = () => _m
                    }
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
                }), (prop, name) => {
                    if (prop.type == 'schemaAttribute') {
                        schemaAttribute = schemaAttribute || name
                        return false
                    }
                    return prop
                })

                /**
                 * Determine if a model with the same PK is in the cache. Use it if it is.
                 */
                const shouldSetSchema = (model._isUnion && schemaAttribute)
                const _key = _model.model().getKey()
                id = model._isUnion ? _.size(cache[_key]) + 1 : id
                if (cache[_key] && cache[_key][id]) {
                    return mergeNested({
                        ...cache[_key][id],
                        ...(shouldSetSchema ? {
                            [schemaAttribute]: _model._definedAttribute
                        } : {})
                    })
                }

                let mocked = _.set(jsf(_model), primary, id)
                if (shouldSetSchema) mocked = _.set(mocked, schemaAttribute, _model._definedAttribute)

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
                const error = opts.error
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
            }, opts.delay)
        })
    }
}

export { mock as default, mock }