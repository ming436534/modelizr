// @flow
import { getPlainFields, isValidType } from '../tools/Filters'
import _ from 'lodash'

import { ClientStateType, ModelDataType, UnionDataType, ModelFunction } from '../types'

let createFaker = () => {
    // eslint-disable-next-line no-console
    console.warn("Faker has been stripped from the production build")
    return false
}
if (process.env.NODE_ENV !== 'production') createFaker = () => require('faker')

/**
 * A utility that generates a V4 UUID
 */
const v4 = (): string => {
    let uuid = ''
    for (let i = 0; i < 32; i++) {
        const value = Math.random() * 16 | 0
        if (i > 4 && i < 21 && !(i % 4)) uuid += '-'
        uuid += ((i === 12) ? 4 : ((i === 16) ? (value & 3 | 8) : value)).toString(16)
    }
    return uuid
}

/**
 * Given a Data Description and a collection of query models, recursively
 * generate data that matches the type-specified of the model.
 *
 * This function will return a promise as it is mocking a fetch request.
 */
export default (clientState: ClientStateType, queryModels: Array<ModelFunction>) => {
    const mockConfig = clientState.config.mock

    /* Generate some fake information based on the type of a field.
     * If the field type is an object, then we handle first the
     * __faker case, and second the __pattern case.
     *
     * if the __faker property is set, generate fake information
     * using fakerjs.
     *
     * If the __pattern property is set, split the property by the
     * delimiter "|" and select one of the resulting strings
     * */
    const generate = (type: any): any => {
        if (typeof type === 'object') {
            const {__type, __faker, __pattern} = type

            if (__faker) {
                const faker = clientState.config.faker || createFaker() // check if a faker instance has been provided in config
                if (!faker) return generate(__type)
                return _.result(faker, __faker)
            }

            if (__pattern) {
                const options = __pattern.split("|")
                const result = _.sample(options)
                switch (type) {
                    case Number:
                    case "number":
                    case "integer": {
                        return parseInt(result)
                    }
                }
                return result
            }
        } else {
            switch (type) {
                case String:
                case "string": {
                    return v4().substring(0, 8)
                }

                case Number:
                case "integer":
                case "number": {
                    return _.random(-10000, 10000)
                }
            }
        }
    }

    const MockModels = (models: Array<ModelFunction>) => {
        const mock = (Model: ModelFunction | Object) => {
            let CurrentModel = Model
            let fieldsToMock = {}
            let ModelData: ?ModelDataType | UnionDataType = false
            let schemaAttribute: ?string = null

            /* Check to see if we are mocking a Model or a nested set of fields */
            if (typeof Model === 'function') {
                ModelData = clientState.models[Model.ModelName]

                /* If the model being mocked is a Union, then it has no actual 'fields'
                 * that we can mock. We need to keep track of its schemaAttribute and
                 * then randomly select one of its Child Models. We override the
                 * currently set ModelFunction with this chosen Model.
                 * */
                if (ModelData._unionDataType) {
                    if (!Model.Children.length) throw new Error(`No children were given to union ${Model.FieldName}`)
                    schemaAttribute = ModelData.schemaAttribute
                    CurrentModel = _.sample(Model.Children)
                    ModelData = clientState.models[CurrentModel.ModelName]

                    /* If the schemaAttribute of the union is a function, then look for
                     * a schemaType on the chosen model.
                     * */
                    if (typeof schemaAttribute === 'function') schemaAttribute = ModelData.schemaType
                }
                fieldsToMock = getPlainFields(ModelData.fields)
            } else {
                fieldsToMock = getPlainFields(Model)
            }

            /* Map over the filtered set of fields and generate information
             * based on their data type. If the field is a nested set of fields,
             * pass that field back into our mock function.
             * */
            let mockedFields = _.mapValues(fieldsToMock, field => {
                if (typeof field === 'object' && !isValidType(field)) return mock(field)
                return generate(field)
            })

            /* If this model is querying child models, then they also need
             * to be mocked. We first check their relationship description
             * to figure out if they should be mocked as a collection or as
             * a single entity.
             * */
            const KeyedFunctions = _.mapKeys(CurrentModel.Children, (model: ModelFunction) => model.FieldName)
            const mockedChildren = _.mapValues(KeyedFunctions, (model: ModelFunction, fieldName: string) => {
                if (ModelData && ModelData.fields && Array.isArray(ModelData.fields[fieldName]))
                    return _.map(_.times(10), () => mock(model))
                return mock(model)
            })

            mockedFields = {
                ...mockedFields,
                ...mockedChildren
            }

            /* Replace the generated primaryKey data with a V4 UUID string and, if
             * the model is a union type, set its schemaAttribute accordingly.
             * */
            if (ModelData && mockedFields[ModelData.primaryKey]) mockedFields[ModelData.primaryKey] = v4()
            if (schemaAttribute) mockedFields[schemaAttribute] = CurrentModel.ModelName

            return mockedFields
        }

        /* We look at mock config to determine if we should generate an array
         * of data or single entities
         * */
        const KeyedFunctions = _.mapKeys(models, (model: ModelFunction) => model.FieldName)
        return _.mapValues(KeyedFunctions, (model, field) => {
            if (typeof mockConfig === 'object') {
                if (mockConfig[field] && mockConfig[field] === Array)
                    return _.map(_.times(10), () => mock(model))
            }
            return mock(model)
        })
    }

    return new Promise(resolve => resolve({
        server_response: {},
        data: MockModels(queryModels),
        errors: null
    }))
}