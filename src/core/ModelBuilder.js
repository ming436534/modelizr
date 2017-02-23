// @flow
import { normalizeFunctionParameters } from '../tools/Filters'
import _ from 'lodash'

import { ModelFunction } from '../types'

/**
 * Construct a functional representation of a model. This method contains
 * no field information but rather config that is used when generating
 * a query.
 *
 * The resulting ModelFunction is a model-builder function, meaning the result
 * of calling it is a new ModelFunction that contains the changes to the
 * original.
 */
export const CreateModel = (newModel: Object | string): ModelFunction => {

	/* The ModelFunction that is returned. This stores information for
	 * query generation such as the FieldName, ModelName of the data it
	 * represents, query parameters and all children models it should
	 * generate.
	 * */
	const Model: ModelFunction = (fieldName: ?string | ?Object | ?ModelFunction,
											modelParams: ?Object | ?ModelFunction,
											...childModels: Array<ModelFunction>) => {
		const {name, params, models} = normalizeFunctionParameters(fieldName, modelParams, childModels)
		const NextModel: ModelFunction = {...Model}

		if (name) NextModel.FieldName = name
		NextModel.Params = {...NextModel.Params, ...params}

		/* A utility method that recursively merges new child models
		 * into the existing collection of child models.
		 *
		 * It uses the models' FieldName and not their ModelName
		 * to match new => old as we do not want to overwrite
		 * unrelated fields.
		 * */
		const mergeChildren = (oldChildren, newChildren) => ([
			..._.filter(oldChildren, (oldChildModel: ModelFunction) =>
				!_.find(newChildren, (newChildModel: ModelFunction) => newChildModel.FieldName == oldChildModel.FieldName)
			),
			..._.map(newChildren, (newChildModel: ModelFunction) => {
				const previousChildModel: ModelFunction = _.find(oldChildren, (childModel: ModelFunction) =>
				childModel.FieldName == newChildModel.FieldName)

				return previousChildModel ? CreateModel({
						...previousChildModel,
						...newChildModel,
						Children: mergeChildren(previousChildModel.Children, newChildModel.Children)
					}) : newChildModel
			})
		])

		NextModel.Children = mergeChildren(NextModel.Children, models)
		return CreateModel(NextModel)
	}

	if (typeof newModel === 'object') {
		_.forEach(newModel, (value, key) => Model[key] = value)
	} else {

		/* We want to store the model name and field name
		 * separately as the field name can change on a per
		 * query basis, while the model name must always
		 * remain consistent.
		 * */
		Model.ModelName = newModel
		Model.FieldName = newModel

		Model.Params = {}
		Model.Children = []
		Model.Filters = {}
		Model.FieldParams = {}
	}

	const setFilter = (key, value) => CreateModel({
		...Model,
		Filters: {
			...Model.Filters,
			[key]: value
		}
	})

	/* Model functions that allows for white-listing and
	 * black-listing model fields on a per-query basis.
	 * */
	Model.only = (fields: Array<string>) => setFilter("only", fields)
	Model.without = (fields: Array<string>) => setFilter("without", fields)
	Model.empty = () => setFilter("empty", true)

	Model.fields = fieldParams => CreateModel({
		...Model,
		FieldParams: {
			...Model.FieldParams,
			...fieldParams
		}
	})

	return Model
}

export default CreateModel