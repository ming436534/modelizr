// @flow
import { normalize, arrayOf } from 'normalizr'
import _ from 'lodash'

import { ModelFunction, ClientStateType, ModelDataType } from '../types'

type NormalizationParameters = {
	Data: Object,
	ModelFunctions: Array<ModelFunction>,
	ClientState: ClientStateType
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
export default ({Data, ModelFunctions, ClientState}: NormalizationParameters): NormalizedData | Object => {
	const {models} = ClientState

	/* Create a map of ModelFunctions who's keys match
	 * those of the Data result
	 * */
	const KeyedFunctions: {[key:string]: ModelFunction} = _.mapKeys(ModelFunctions,
		(ModelFunction: ModelFunction) =>
			ModelFunction.FieldName)

	if (!Data) return {}
	return normalize(Data, _.mapValues(KeyedFunctions, (ModelFunction: ModelFunction) => {
		const Entities = Data[ModelFunction.FieldName]
		const ModelData: ModelDataType = models[ModelFunction.ModelName]

		if (Array.isArray(Entities)) return arrayOf(ModelData.normalizrSchema)
		return ModelData.normalizrSchema
	}))
}