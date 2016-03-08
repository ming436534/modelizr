import { Schema as NormalizerSchema } from 'normalizr'
import { applyMutators, _ } from './utils'

const schema = (name, schema, options) => {
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
            params: params
        }

        return applyMutators(response, 'model')
    }

    model.schema = schema

    return applyMutators(model, 'schema')
}

export { schema as default, schema }