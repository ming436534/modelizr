import { ModelBase } from './bases'
import { unionOf } from 'normalizr'
import { _ } from './utils'

class Union extends ModelBase {
    constructor(schema, models) {
        super()
        this._models = _.filter(models, model => model)
        this._schema = schema
    }

    apply(key, value) {
        this._schema[key] = value
        return this
    }

    params = params => this.apply('params', params)
}

const union = (key, models, options) => {
    options = options || {}

    const attribute = options.schemaAttribute ? {
        schemaAttribute: options.schemaAttribute
    } : {}

    const union = (params, ..._models) => {
        if (params && params instanceof ModelBase) {
            _models.unshift(params)
            params = {}
        }

        let valid = true
        _.forEach(_models, val => {
            if (!_.find(models, model => model.schema.model == val._schema.model())) valid = false
        })
        if (!valid) {
            throw new Error("A union must be given models that have already been defined.")
        }

        const schema = {
            ...options,
            models,
            key,
            params,
            _isUnion: true
        }

        return new Union(schema, _models)
    }
    union.unionOf = _.mapValues(models, model => model.schema.model)
    union.define = () => {
        return unionOf(_.mapValues(models, model => model.schema.model), {schemaAttribute: attribute})
    }

    return union
}

export { union }