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

class Definition {
    constructor(model, options) {
        options = options || {}
        this.model = model
        this.options = options.schemaAttribute
    }
    
    define() {
        return _valuesOf(this.model, this.options)
    }
}

class ArrayOf extends Definition {
    
}
class ValuesOf extends Definition {
    
}
class UnionOf extends Definition {
    define() {
        return _unionOf(this.model, this.options)
    }
}

const arrayOf = (model, options) => new ArrayOf(model.schema.model, options)
const valuesOf = (model, options) => new ValuesOf(model.schema.model, options)
const unionOf = (model, options) => new UnionOf(model.schema.model, options)

export { normalize as default, arrayOf, valuesOf, unionOf, ArrayOf, ValuesOf, UnionOf, Definition }