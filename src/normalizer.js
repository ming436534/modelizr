import { normalize as Normalize, arrayOf as _arrayOf, valuesOf as _valuesOf, unionOf as _unionOf } from 'normalizr'
import { _ } from './utils'

const normalize = (response, ...query) => {
    const _query = _.mapKeys(_.mapValues(query, model => model.build()), model => model.key)

    return Normalize(response, _.mapValues(_query, (entity, key) => {

        const model = entity.model()
        const attribute = entity._attribute ? {
            schemaAttribute: entity._attribute
        } : {}

        switch (entity._modelType) {
            case "valuesOf":
                return _valuesOf(model, attribute)
            case "arrayOf":
                return _arrayOf(model, attribute)
        }

        if (Array.isArray(response[key])) return _arrayOf(model, attribute)
        if (_.hasValuesOf(response[key], model)) return _valuesOf(model, attribute)

        return model
    }))
}

class Iterable {
    constructor(model, options) {
        options = options || {}
        this.model = model
        this.options = _.pick(options, ['schemaAttribute'])
    }
    
    define() {
        return _valuesOf(this.model.schema ? this.model.schema.model : this.model, this.options)
    }
}

class ValuesOf extends Iterable {
    
}

const arrayOf = (model, options) => new Iterable(model, options)
const valuesOf = (model, options) => new ValuesOf(model, options)

export { normalize as default, arrayOf, valuesOf, ValuesOf, Iterable }