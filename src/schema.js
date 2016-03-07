import { Schema as NormalizerSchema, arrayOf } from 'normalizr'
import { applyMutators, _ } from './utils'

const defineSchemas = (...schemas) => {
    const orderedSchemas = _.mapKeys(_.map(schemas, schema => schema.schema), schema => schema.name)

    _.forEach(orderedSchemas, schema => {
        if (!schema.model) {
            schema.model = new NormalizerSchema(schema.key)
        }

        schema.model.define(_.mapValues(_.pickBy(schema.properties, property => property.model),
            definition => {
                definition = definition.model
                const findOrCreate = key => {
                    if (!orderedSchemas[key].model) {
                        orderedSchemas[key].model = new NormalizerSchema(orderedSchemas[key].key)
                    }

                    return orderedSchemas[key].model
                }
                if (Array.isArray(definition)) {
                    return arrayOf(findOrCreate(definition[0]))
                }
                if (typeof definition === 'string') {
                    return findOrCreate(definition)
                }
                return definition
            })
        )
    })
}

const schema = (name, schema) => {
    schema = ({
        ...{
            name,
            key: `${name}s`,
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

export { schema as default, schema, defineSchemas }