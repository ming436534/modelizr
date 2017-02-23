// @flow
import { ClientStateType, ModelFunction, ModelDataType, UnionDataType } from '../types'
import { stripRelationships, isValidType } from '../tools/Filters'
import _ from 'lodash'

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
export default ({clientState, queryModels, queryType, queryName, queryParameters}: GeneratorParameters): string => {
	const {models} = clientState

	/* This compiles a FieldMap from a a collection of models. It is much
	 * easier to generate a query from a normalized description of fields.
	 * */
	const makeMap = (queryModels: Array<ModelFunction>, prefix: boolean = false): Array<FieldMap> => (
		_.map(queryModels, (modelFunction: ModelFunction): FieldMap => {
			const modelData: ModelDataType | UnionDataType = models[modelFunction.ModelName]

			/* Utility that strips modifier rejected fields. */
			const filter = fields => (
				_.pickBy(fields, (field, fieldName: string) => {
					const {only, without, empty} = modelFunction.Filters
					if (only) return _.find(only, field => field == fieldName)
					if (without) return !_.find(without, field => field == fieldName)
					if (empty) return false
					return true
				})
			)

			/* Filter out fields that have been rejected via modifiers,
			 * strip any model relationships from the fields and recursively
			 * generate a FieldMap.
			 * */
			const pruneFields = (fields: Object): Array<string | FieldMap> => (
				_.map(filter(stripRelationships(fields)), (field, fieldName: string) => {

						/* We check for an alias property on the field type.
						 * If one is found, use it instead of the fieldName
						 * */
						if (field.alias) fieldName = `${fieldName}: ${field.alias}`
						return fieldName
					}
				)
			)

			return {
				name: `${prefix ? "... on " : ""}${modelFunction.FieldName}`,
				params: modelFunction.Params,
				fields: [...pruneFields(modelData.fields), ...makeMap(modelFunction.Children, modelData._unionDataType)]
			}
		})
	)

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

	return `${queryType} ${queryName || `modelizr_${queryType}`}${buildParameters(queryParameters)} {${_.map(FieldMaps, FieldMap => GenerateFields(FieldMap))}\n}`
}