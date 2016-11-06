// @flow
import _ from 'lodash'
import { getPlainFields, isValidType } from '../tools/Filters'

import { ClientStateType, ModelFunction, ModelDataType, UnionDataType } from '../types'

type GenParameters = {
    ClientState: ClientStateType,
    queryModels: Array<ModelFunction>,
    queryType: String,
    queryName: ?String,
    queryParams: ?Object
}

type FieldMap = {
    name: String,
    params: ?Object,
    fields: Array<String | FieldMap>
}

const SPACES = 2

const buildParameters = (params: ?Object<any>): String => {
    if (!params || _.isEmpty(params)) return ""
    return `(${_.map(_.pickBy(params, param => param || param === false), (param, key) =>
        `${key}: ${JSON.stringify(param).replace(/"([^(")"]+)":/g, "$1:")}`)})`
}

const createIndent = spaces => _.join(_.times((spaces * SPACES) + 1, ""), " ")

export default ({ClientState, queryModels, queryType, queryName, queryParams}: GenParameters): String => {
    const {models} = ClientState
    const makeMap = (queryModels: Array<ModelFunction>, prefix: Boolean = false): Array<FieldMap> =>
        _.map(queryModels, (ModelFunction: ModelFunction): FieldMap => {
            const ModelData: ModelDataType | UnionDataType = models[ModelFunction.ModelName]

            const filter = fields =>
                _.pickBy(fields, (type, field) => {
                    const {only, without} = ModelFunction.Filters
                    if (only) return _.find(only, _field => _field == field)
                    if (without) return !_.find(without, _field => _field == field)
                    return true
                })

            const pruneFields = (fields): String | FieldMap =>
                _.map(filter(getPlainFields(fields)), (type, field) =>
                    isValidType(type) ? field : {name: field, fields: pruneFields(type)}
                )

            return {
                name: `${prefix ? "... on " : ""}${ModelFunction.FieldName}`,
                params: ModelFunction.Params,
                fields: [...pruneFields(ModelData.fields), ...makeMap(ModelFunction.Children, ModelData._unionDataType)]
            }
        })

    const FieldMaps: Array<FieldMap> = makeMap(queryModels)

    const GenerateFields = (FieldMap: FieldMap, indent: Number = 2) =>
        `\n${createIndent(indent - 1)}${FieldMap.name}${buildParameters(FieldMap.params)} {${_.map(FieldMap.fields, field =>
            typeof field === 'string' ? `\n${createIndent(indent)}${field}` :
                `${GenerateFields(field, indent + 1)}`
        )}\n${createIndent(indent - 1)}}`

    return `${queryType} ${queryName || queryType}${buildParameters(queryParams)} {${_.map(FieldMaps, FieldMap => GenerateFields(FieldMap))}\n}`
}