// @flow
import _ from 'lodash'
import { getPlainFields, isValidType } from '../tools/Filters'

import { ClientStateType, ModelFunction, ModelDataType, UnionDataType } from '../types'

type GeneratorParameters = {
    ClientState: ClientStateType,
    queryModels: Array<ModelFunction>,
    queryType: string,
    queryName: ?string,
    queryParams: ?Object
}

type FieldMap = {
    name: string,
    params: ?Object,
    fields: Array<string | FieldMap>
}

/**
 * Utility method that generates a certain amount of spaces
 * in a string.
 */
const SPACES = 2
const createIndent = (spaces: number): string =>
    _.join(_.times((spaces * SPACES) + 1, () => ""), " ")

/* Construct a valid GraphQL parameter string from an object */
const buildParameters = (params: ?Object): string => {
    if (!params || _.isEmpty(params)) return ""
    return `(${_.map(_.pickBy(params, param => param || param === false), (param, key) =>
        `${key}: ${JSON.stringify(param).replace(/"([^(")"]+)":/g, "$1:")}`)})`
}

/**
 * Generate a GraphQL query from a collection of modelizr models.
 */
export default ({ClientState, queryModels, queryType, queryName, queryParams}: GeneratorParameters): string => {
    const {models} = ClientState

    /* This compiles a FieldMap from a a collection of models. It is much
     * easier to generate a query from a normalized description of fields.
     * */
    const makeMap = (queryModels: Array<ModelFunction>, prefix: boolean = false): Array<FieldMap> =>
        _.map(queryModels, (ModelFunction: ModelFunction): FieldMap => {
            const ModelData: ModelDataType | UnionDataType = models[ModelFunction.ModelName]

            /* Utility that strips modifier rejected fields. */
            const filter = fields =>
                _.pickBy(fields, (type, field) => {
                    const {only, without} = ModelFunction.Filters
                    if (only) return _.find(only, _field => _field == field)
                    if (without) return !_.find(without, _field => _field == field)
                    return true
                })

            /* Filter out fields that have been rejected via modifiers and
             * strip any model relationships from the fields and recursively
             * generate a FieldMap.
             * */
            const pruneFields = (fields: Object): Array<string | FieldMap> =>
                _.map(filter(getPlainFields(fields)), (type, field) => {
                        if (Array.isArray(type)) type = type[0]
                        return isValidType(type) ? field : {name: field, fields: pruneFields(type)}
                    }
                )

            return {
                name: `${prefix ? "... on " : ""}${ModelFunction.FieldName}`,
                params: ModelFunction.Params,
                fields: [...pruneFields(ModelData.fields), ...makeMap(ModelFunction.Children, ModelData._unionDataType)]
            }
        })

    const FieldMaps: Array<FieldMap> = makeMap(queryModels)

    /* Generate an indented and multi-lined GraphQL query string
     * from our FieldMap. The type and name of the generated
     * query will be determined based on the queryType and queryName
     * parameters.
     * */
    const GenerateFields = (FieldMap: FieldMap, indent: number = 2): string => {
        const {name, fields, params} = FieldMap
        const length = !!fields.length

        return `\n${createIndent(indent - 1)}${name}${buildParameters(params)} ${length ? "{" : ""}${_.map(fields, field =>
            typeof field === 'string' ? `\n${createIndent(indent)}${field}` :
                `${GenerateFields(field, indent + 1)}`
        )}\n${createIndent(indent - 1)}${length ? "}" : ""}`
    }

    return `${queryType} ${queryName || `modelizr_${queryType}`}${buildParameters(queryParams)} {${_.map(FieldMaps, FieldMap => GenerateFields(FieldMap))}\n}`
}