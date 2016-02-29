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

                const makeQuery = (entity, key) => {
                    const entities = _.omit(entity, ['model', 'type', 'params', 'properties'])

                    return `${key}(${makeParams(entity.params)}) {` +
                        `${entity.properties || _.map(schemas[entity.model].getProperties(), (entity, key) => `\n\      ${key}`)}` +
                        `${_.isEmpty(entities) ? '' : ',\n   '}${_.map(entities, makeQuery)}\n   }`
                }

                if (!entity.model) {
                    throw new Error(`no model was specified for the entity ${key}`)
                }
                if (entity.type == 'mutation') {
                    builtQuery += `mutation ${key} {\n   ${key}(${makeParams(entity.params)})\n}`
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
        models: schemas,
        mock,
        mockAll,
        buildRequest
    }
}

export { defineSchemas as default, defineSchemas }