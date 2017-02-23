// @flow
import { ModelFunction, ClientStateType, UnionDataType, ModelDataType, ModelDatatypeField } from '../types'
import { Schema, arrayOf, unionOf } from 'normalizr'
import _ from 'lodash'

import { normalizeModelData } from '../tools/filters'
import requestBuilder from './RequestBuilder'
import { FETCH_API } from '../tools/fetch'
import createModel from './ModelBuilder'

export default class Modelizr {

	clientState: ClientStateType;
	models: {[key:string]: ModelFunction} = {};

	constructor(InitialClientState: ClientStateType) {
		if (!InitialClientState) throw new Error("Modelizr expects a Client State as its first parameter")

		this.clientState = InitialClientState
		this.clientState.models = normalizeModelData(this.clientState.models)

		/* order is important, all model schemas must exist before
		 * union schemas are created
		 * */
		this.generateModelFunctions()
		this.buildUnionSchemas()
		this.defineModelRelationships()

		const defaultConfig = {
			mock: false,
			debug: false,
			api: FETCH_API,
			throwOnErrors: true
		}

		this.clientState.config = {
			...defaultConfig,
			...InitialClientState.config || {}
		}
		if (!this.clientState.config.endpoint)
			throw new Error("Please provide a base endpoint to make queries to")
	}

	/* Create ModelFunctions from the given model Data.
	 *
	 * If the DataType is a model (and not a union) then build
	 * its normalizr schema. We do not create schemas' for unions until
	 * after _all_ model schemas are present.
	 * */
	generateModelFunctions() {
		const {models} = this.clientState

		_.forEach(models, (data, name) => {
			const ModelData: ModelDataType | UnionDataType = {...data}

			if (!ModelData.normalizeAs) ModelData.normalizeAs = name
			if (!ModelData.primaryKey) ModelData.primaryKey = "id"

			if (!ModelData._unionDataType) ModelData.normalizrSchema = new Schema(ModelData.normalizeAs, {
				idAttribute: ModelData.primaryKey,
				...ModelData.normalizrOptions || {}
			})

			this.clientState.models[name] = ModelData
			this.models[name] = createModel(name)
		})
	}

	/* Build all normalizr schemas for union DataTypes. A check
	 * to make sure the union is nor referencing imaginary models
	 * is performed.
	 * */
	buildUnionSchemas() {
		const {models} = this.clientState

		_.forEach(models, (modelData: ModelDataType | UnionDataType, modelName: string) => {
			if (modelData._unionDataType) {

				/* filter out all non-existing models and warn about them */
				const existingModels = _.filter(modelData.models, model => {
					if (models[model]) return true

					// eslint-disable-next-line no-console
					console.warn(`Model "${model}" on union ${modelName} points to an unknown model`)
				})

				/* create a normalizr union */
				modelData.normalizrSchema = unionOf(_.mapValues(_.mapKeys(existingModels, model => model), model =>
						models[model].normalizrSchema
					), {schemaAttribute: modelData.schemaAttribute}
				)
			}
		})
	}

	/* Recursively populate relationship information of each models
	 * normalizr schema
	 * */
	defineModelRelationships() {
		const {models} = this.clientState

		type UnwrappedField = {
			type: string,
			isArray: boolean
		}

		/* Utility that flattens a field wrapped in an array */
		const unWrapArray = (field: ModelDatatypeField): UnwrappedField =>
			Array.isArray(field.type) ? {isArray: true, type: field.type[0]} :
				{isArray: false, type: field.type}

		_.forEach(models, (modelData: ModelDataType | UnionDataType, modelName: string) => {
			if (!modelData._unionDataType) {

				/* Filter out any model references that do not exist in our data set */
				const modelFields = _.pickBy(modelData.fields, (field: ModelDatatypeField, fieldName: string) => {
					const {isArray, type} = unWrapArray(field)
					if (typeof type === 'string') {
						if (models[type]) return true

						// eslint-disable-next-line no-console
						console.warn(
							`Field { ${fieldName}: ${isArray ? "[" : ""}"${type}"${isArray ? "]" : ""} } on '${modelName}' points to an unknown model`
						)
					}
				})

				/* Recursively define all model relationships on
				 * Model normalizr schemas
				 * */
				modelData.normalizrSchema.define(
					_.mapValues(modelFields, field => {
							const {isArray, type} = unWrapArray(field)
							const childModel: ModelDataType | UnionDataType = models[type]

							if (isArray) return arrayOf(childModel.normalizrSchema)
							return childModel.normalizrSchema
						}
					)
				)
			}
		})
	}

	query = (...args: Array<any>) => requestBuilder(this.clientState, "query")(...args)
	mutate = (...args: Array<any>) => requestBuilder(this.clientState, "mutation")(...args)
	fetch = (...args: Array<any>) => requestBuilder(this.clientState, "fetch")(...args)
}