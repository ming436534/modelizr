// @flow
import { ModelFunction, ClientStateType, ModelDataType } from '../types'
import { normalize, arrayOf } from 'normalizr'
import _ from 'lodash'

type NormalizationParameters = {
	data: Object,
	modelFunctions: Array<ModelFunction>,
	clientState: ClientStateType
}

type NormalizedData = {
	entities: Object,
	result: Object
}

/**
 * A function that normalizes data based on specified model relationships using
 * normalizr.
 *
 * This will map over the provided models and pass in a normalizr schema containing
 * each models schema. If the entities from the response that match the model are
 * an array, the schema will be wrapped in arrayOf().
 */
export default ({data, modelFunctions, clientState}: NormalizationParameters): NormalizedData | Object => {
	const {models} = clientState

	/* Create a map of ModelFunctions who's keys match
	 * those of the Data result
	 * */
	const keyedFunctions: {[key:string]: ModelFunction} = _.mapKeys(modelFunctions,
		(modelFunction: ModelFunction) =>
			modelFunction.fieldName)

	if (!data) return {}
	return normalize(data, _.mapValues(keyedFunctions, (modelFunction: ModelFunction) => {
		const entities = data[modelFunction.fieldName]
		const modelData: ModelDataType = models[modelFunction.modelName]

		if (Array.isArray(entities)) return arrayOf(modelData.normalizrSchema)
		return modelData.normalizrSchema
	}))
}