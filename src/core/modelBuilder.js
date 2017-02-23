// @flow
import { normalizeFunctionParameters } from '../tools/filters'
import { ModelFunction } from '../types'
import _ from 'lodash'

/**
 * Construct a functional representation of a model. This method contains
 * no field information but rather config that is used when generating
 * a query.
 *
 * The resulting ModelFunction is a model-builder function, meaning the result
 * of calling it is a new ModelFunction that contains the changes to the
 * original.
 */
const createModel = (modelName: string) => {

	/* The ModelFunction that is returned. This stores information for
	 * query generation such as the FieldName, ModelName of the data it
	 * represents, query parameters and all children models it should
	 * generate.
	 * */
	const model: ModelFunction = (fieldName, modelParams, ...children) => {
		const {name, params, models} = normalizeFunctionParameters(fieldName, modelParams, children)

		const newModel = createModel(modelName)
		newModel.fieldName = name || model.fieldName
		newModel.params = {...model.params, ...params || {}}
		newModel.children = [...model.children, ...models || []]

		newModel.children = _.uniqBy(newModel.children, (child: ModelFunction) => child.fieldName)

		return newModel
	}

	/* We want to store the model name and field name
	 * separately as the field name can change on a per
	 * query basis, while the model name must always
	 * remain consistent.
	 * */
	model.modelName = modelName
	model.fieldName = modelName

	model.params = {}
	model.children = []
	model.filters = {}

	/* Modifiers that allows for white-listing and
	 * black-listing model fields on a per-query basis.
	 * */
	model.only = (fields: Array<string>) => {
		model.filters.only = [...model.filters.only || [], ...fields]
		return model
	}

	model.without = (fields: Array<string>) => {
		model.filters.without = [...model.filters.without || [], ...fields]
		return model
	}

	model.only = () => {
		model.filters.empty = true
		return model
	}

	return model
}

export default createModel