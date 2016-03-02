import { normalize, arrayOf } from 'normalizr'
import _ from 'lodash'

const defineSchemas = schemas => {
    _.forEach(schemas, schema => schema.define(schemas))

    const mock = (entity, ids = _.range(1, 21)) => {
        if (typeof entity === 'string') {
            return schemas[entity].mock(ids)
        } else {
            return entity.mock(ids)
        }
    }
    const mockAll = ids => _.mapValues(_.mapKeys(schemas, schema => schema.getKey()), entity => mock(entity, ids))

    const buildRequest = query => ({
        getGraphQuery: () => {
            let builtQuery = ``

            _.forIn(query, (entity, key) => {
                const makeParams = params => {
                    const getType = param => {
                        if (Array.isArray(param)) {
                            return `[${param}]`
                        } else {
                            return `"${param}"`
                        }
                    }

                    return _.map(params, (param, key) => `${key}: ${getType(param)}`)
                }

                const mapProps = props => {
                    if (props.model) {
                        const fetchIncludes = (subProps, parentModel) => {
                            const getSchema = (name, notSchema) => {
                                if (Array.isArray(name)) {
                                    name = name[0]
                                }
                                return notSchema ? name : schemas[name]
                            }

                            if (subProps.includes) {
                                return _.mapValues(_.mapKeys(_.map(subProps.includes, model => {
                                    if (typeof model === 'object') {
                                        return {
                                            key: model.definition,
                                            props: {
                                                type: 'object',
                                                properties: {
                                                    ...getSchema(schemas[parentModel].getDefinitions()[model.definition]).getProperties(),
                                                    ...fetchIncludes(model,
                                                        getSchema(schemas[parentModel].getDefinitions()[model.definition], true)
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    return {
                                        key: model,
                                        props: {
                                            type: 'object',
                                            properties: getSchema(schemas[parentModel].getDefinitions()[model]).getProperties()
                                        }
                                    }
                                }), model => model.key), model => model.props)
                            }

                            return {}
                        }

                        const newProps = props.properties || schemas[props.model].getProperties()

                        props = {
                            ...newProps,
                            ...fetchIncludes(props, props.model)
                        }
                    }

                    return _.map(props, (entity, key) => {
                        if (entity.type == 'object') {
                            return `\n      ${key} {${mapProps(entity.properties || {})}\n      }`
                        } else {
                            return `\n\      ${key}`
                        }
                    })
                }

                const makeQuery = (entity, key) => {
                    const entities = _.omit(entity, ['model', 'type', 'params', 'properties', 'includes'])

                    return `${key}${entity.params ? ` (${makeParams(entity.params)}) ` : ''} {` +
                        `${mapProps(entity)}` +
                        `${_.isEmpty(entities) ? '' : ',\n   '}${_.map(entities, makeQuery)}\n   }`
                }

                if (!entity.model) {
                    throw new Error(`no model was specified for the entity ${key}`)
                }
                if (entity.type == 'mutation') {
                    builtQuery += `mutation ${key} {\n   ${key}(${makeParams(entity.params)}) ` +
                        `{${mapProps(entity)}\n   }\n}`
                } else {
                    builtQuery += `{\n   ${makeQuery(entity, key)}\n}`
                }
            })

            return builtQuery
        },

        mock: () => {
            const mockNestedRequest = (entity, id) => {
                const models = _.pickBy(entity, child => child && child.model)

                const getNewId = length => (id && typeof id === 'number' ? (id * length - length) : 0)

                if (entity.params) {
                    const requestedIds = entity.params.id || entity.params.ids
                    if (requestedIds) {
                        if (Array.isArray(requestedIds)) {
                            id = _.map(requestedIds, requestedId => requestedId + getNewId(requestedIds.length))
                        } else {
                            id = requestedIds + (id || 0)
                        }
                    } else {
                        id = undefined
                    }
                } else {
                    id = _.map(_.range(1, 21), requestedId => requestedId + getNewId(20))
                }

                const mockedEntity = mock(entity.model, id)

                if (Array.isArray(mockedEntity)) {
                    return _.map(mockedEntity, entity => ({
                        ...entity,
                        ..._.mapValues(models, model => mockNestedRequest(model, entity.id))
                    }))
                } else {
                    return {
                        ...mockedEntity,
                        ..._.mapValues(models, model => mockNestedRequest(model, mockedEntity.id))
                    }
                }
            }

            return {
                ..._.mapValues(query, mockNestedRequest)
            }
        },

        normalize: response => normalize(response, _.mapValues(query, (entity, key) => {
            if (Array.isArray(response[key])) {
                return arrayOf(schemas[entity.model])
            } else {
                return schemas[entity.model]
            }
        }))
    })

    return {
        schemas,
        mock,
        mockAll,
        buildRequest
    }
}

export { defineSchemas as default, defineSchemas }