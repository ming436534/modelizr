// @flow
import { stripRelationships, isValidType } from '../tools/Filters'
import { generator } from './DataGeneration'
import { v4 } from '../tools/uuid'
import _ from 'lodash'

import { ClientStateType, ModelDataType, UnionDataType, ModelFunction } from '../types'

/**
 * Given a Data Description and a collection of query models, recursively
 * generate data that matches the type-specified of the model.
 *
 * This function will return a promise as it is mocking a fetch request.
 */
export default (clientState: ClientStateType, queryModels: Array<ModelFunction>) => {
	const mockConfig = clientState.config.mock

	const generate = generator(clientState.config.faker)

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
				fieldsToMock = stripRelationships(ModelData.fields)
			} else {
				fieldsToMock = stripRelationships(Model)
			}

			/* Map over the filtered set of fields and generate information
			 * based on their data type. If the field is a nested set of fields,
			 * pass that field back into our mock function.
			 * */
			let mockedFields = _.mapValues(fieldsToMock, field => {
				const generateOrMock = type => {
					if (typeof type === 'object' && !isValidType(type)) return mock(type)
					return generate(type)
				}

				if (Array.isArray(field)) {
					field = field[0]
					return _.map(_.times(10), () => generateOrMock(field))
				}

				return generateOrMock(field)
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