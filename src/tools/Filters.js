// @flow
import { ModelFunction, ModelDataCollection, ModelDataType } from '../types'
import _ from 'lodash'

/* Checks if a piece of information is a valid
 * data description
 * */
export const isValidType = (field: {type: any}): Boolean => {
	let {type} = field

	if (Array.isArray(type)) {
		type = type[0]
	}

	const validTypes = [
		Boolean,
		String,
		Number
	]

	return _.find(validTypes, validType => validType === type)
}

/* Strips a collection of fields of all model relationships
 * */
export const stripRelationships = (fields: Object) => (
	_.pickBy(fields, field => typeof field.type !== "string")
)

type NormalizedParameters = {
	name?: string,
	params: Object,
	models: Array<ModelFunction>
}

/* Given three parameters, figure out the type of each param and return
 * a corrected set of parameters.
 * */
export const normalizeFunctionParameters = (name: string | Object | ModelFunction,
														  params: Object | ModelFunction,
														  models: Array<ModelFunction>): NormalizedParameters => {
	const trueModels = models
	let trueName,
		trueParams = {}

	if (typeof name === 'string') {
		trueName = name

		if (typeof params === 'function') trueModels.unshift(params)
		if (typeof params === 'object') trueParams = params
	} else {
		if (params) trueModels.unshift(params)

		if (typeof name === 'function') trueModels.unshift(name)
		if (typeof name === 'object') trueParams = name
	}

	return {name: trueName, params: trueParams, models: trueModels}
}

export const normalizeModelData = (modelData: ModelDataCollection): ModelDataCollection => (
	_.mapValues(modelData, (model: ModelDataType) => {
		if (model.fields) {
			return {
				...model,
				fields: _.mapValues(model.fields, field => {
					if (typeof field === "object") return field

					return {
						type: field
					}
				})
			}
		}

		return model
	})
)