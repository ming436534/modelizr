// @flow
import { ClientStateType, ModelDataType, UnionDataType, ModelFunction } from '../types'
import { stripRelationships } from '../tools/filters'
import { generator } from './dataGeneration'
import { v4 } from '../tools/uuid'
import _ from 'lodash'

/**
 * Given a Data Description and a collection of query models, recursively
 * generate data that matches the type-specified of the model.
 *
 * This function will return a promise as it is mocking a fetch request.
 */
export default (clientState: ClientStateType, queryModels: Array<ModelFunction>) => {
	const mockConfig = clientState.config.mock

	const generate = generator(clientState.config.faker)

	const mockModels = (models: Array<ModelFunction>) => {
		const mockModel = (model: ModelFunction | Object) => {
			let currentModel = model
			let modelData: ModelDataType | UnionDataType = clientState.models[model.modelName]
			let schemaAttribute: ?string = null

			/* If the model being mocked is a Union, then it has no actual 'fields'
			 * that we can mock. We need to keep track of its schemaAttribute and
			 * then randomly select one of its Child Models. We override the
			 * currently set ModelFunction with this chosen Model.
			 * */
			if (modelData._unionDataType) {
				if (!model.children.length) throw new Error(`No children were given to union ${model.fieldName}`)
				schemaAttribute = modelData.schemaAttribute
				currentModel = _.sample(model.children)
				modelData = clientState.models[currentModel.modelName]

				/* If the schemaAttribute of the union is a function, then look for
				 * a schemaType on the chosen model.
				 * */
				if (typeof schemaAttribute === 'function') schemaAttribute = modelData.schemaType
			}
			const fieldsToMock = stripRelationships(modelData.fields)

			/* Map over the filtered set of fields and generate information
			 * based on their data type. If the field is a nested set of fields,
			 * pass that field back into our mock function.
			 * */
			const mockFields = fields => (
				_.mapValues(fields, field => {
					const generateOrMock = field => {
						if (field.type === Object) {
							return mockFields(stripRelationships(field.properties || {}))
						}
						return generate(field)
					}

					if (Array.isArray(field.type)) {
						return _.map(_.times(field.quantity || 10), () => generateOrMock({...field, type: field.type[0]}))
					}

					return generateOrMock(field)
				})
			)

			let mockedFields = mockFields(fieldsToMock)

			/* If this model is querying child models, then they also need
			 * to be mocked. We first check their relationship description
			 * to figure out if they should be mocked as a collection or as
			 * a single entity.
			 * */
			const keyedFunctions = _.mapKeys(currentModel.children, (model: ModelFunction) => model.fieldName)
			const mockedChildren = _.mapValues(keyedFunctions, (model: ModelFunction, fieldName: string) => {
				if (modelData.fields[fieldName]) {
					const {type, quantity} = modelData.fields[fieldName]
					if (Array.isArray(type)) {
						return _.map(_.times(quantity || 10), () => mockModel(model))
					}
				}

				return mockModel(model)
			})

			mockedFields = {
				...mockedFields,
				...mockedChildren
			}

			/* Replace the generated primaryKey data with a V4 UUID string and, if
			 * the model is a union type, set its schemaAttribute accordingly.
			 * */
			if (modelData && mockedFields[modelData.primaryKey]) mockedFields[modelData.primaryKey] = v4()
			if (schemaAttribute) mockedFields[schemaAttribute] = currentModel.modelName

			return mockedFields
		}

		/* We look at mock config to determine if we should generate an array
		 * of data or single entities
		 * */
		const keyedFunctions = _.mapKeys(models, (model: ModelFunction) => model.fieldName)
		return _.mapValues(keyedFunctions, (model, field) => {
			if (typeof mockConfig === 'object') {
				if (mockConfig[field] && mockConfig[field] === Array)
					return _.map(_.times(10), () => mockModel(model))
			}
			return mockModel(model)
		})
	}

	return new Promise(resolve => resolve({
		server_response: {},
		data: mockModels(queryModels),
		errors: null
	}))
}