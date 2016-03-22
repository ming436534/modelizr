import { Schema as NormalizerSchema } from 'normalizr'
import { arrayOf } from './normalize'
import { _ } from './utils'

class Model {
    constructor(schema, params, ...models) {
        if (params && params instanceof Model) {
            models.unshift(params)
            params = {}
        }

        this._models = _.filter(models, model => model)
        this._schema = {
            ...schema,
            model: () => schema.model,
            params
        }
    }

    build() {
        return {
            ...this._schema,
            properties: {
                ...this._schema.properties,
                ..._.mapKeys(_.mapValues(this._models, model => model.build()), model => model.key)
            }
        }
    }

    apply(key, value) {
        this._schema[key] = value
        return this
    }

    as = key => this.apply('key', key)
    params = params => this.apply('params', params)
    without = exclusion => this.apply('properties', _.omit(this._schema.properties, exclusion))
    only = selection => this.apply('properties', _.pick(this._schema.properties, selection))
    onlyIf = statement => this.apply('continue', statement !== false ? true : false)

    normalizeAs(key) {
        const model = this._schema.model()
        model._key = key
        return this.apply('model', () => model)
    }

    properties(props, overwrite) {
        if (Array.isArray(props)) {
            props = _.mapValues(_.mapKeys(props, prop => prop), () => ({type: 'string'}))
        }

        return this.apply('properties', overwrite ? props : {
            ...this._schema.properties,
            ...props
        })
    }
}

const model = (name, schema, options) => {
    if (!schema.properties && !schema.required) {
        schema = {
            properties: schema
        }
    }

    schema = ({
        ...{
            name,
            key: name,
            model: new NormalizerSchema(name, options),
            type: 'object',
            additionalProperties: false,
            required: ['id', ..._.map(_.omitBy(schema.properties, prop => prop.model), (prop, key) => key)],
            _isModel: true
        },
        ...schema,
        ...{
            properties: {
                ...{
                    id: {type: 'integer'}
                },
                ...schema.properties || {}
            }
        }
    })

    const response = (params, ...models) => new Model(response.schema, params, ...models,)
    response.schema = schema
    response.define = definitions => {
        response.schema.model.define(_.mapValues(definitions, definition => {
            if (Array.isArray(definition)) {
                return arrayOf(definition[0], definition[1])
            } else if (definition.schema) {
                return definition.schema.model
            }
            return definition
        }))
    }
    response.getKey = () => response.schema.key

    return response
}

const request = model('_request', {})

export { model as default, model, Model, request }