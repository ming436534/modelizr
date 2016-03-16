import { Schema as NormalizerSchema } from 'normalizr'
import { applyMutators, _ } from './utils'

const schema = (name, schema, options) => {
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
            required: ['id', ..._.map(_.omitBy(schema.properties, prop => prop.model), (prop, key) => key)]
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

    const model = (params, ...models) => {
        if (params && typeof params !== 'object') {
            models.unshift(params)
            params = undefined
        }

        models = _.filter(models, model => model)

        const response = () => {
            response.construct = {
                ...response.construct,
                properties: {
                    ...response.construct.properties,
                    ..._.mapKeys(_.mapValues(models, model => model()), model => model.key)
                }
            }

            return response.construct
        }

        response.construct = {
            ...model.schema,
            model: () => model.schema.model,
            _isModel: true,
            params: params
        }

        return applyMutators(response, 'model')
    }

    model.schema = schema

    return applyMutators(model, 'schema', schema.mutators)
}

schema.addMutators = mutators => schema.mutators = {
    ...schema.mutators || {},
    mutators
}

const request = schema('_request', {})

export { schema as default, schema, request }