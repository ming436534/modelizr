// @flow
import { Schema, arrayOf, unionOf } from 'normalizr'
import _ from 'lodash'

import CreateModel from './ModelBuilder'
import { isValidType } from '../tools/Filters'
import { FETCH } from '../tools/Fetch'

import { ModelFunction, ClientStateType, UnionDataType, ModelDataType } from '../types'

export default class Modelizr {

    ClientState: ClientStateType;
    config: ConfigType;

    models: Object<ModelFunction> = {};

    constructor(InitialClientState: ClientStateType) {
        if (!InitialClientState) throw new Error("Modelizr expects a Client State as its first parameter")
        if (!InitialClientState.config.endpoint && !InitialClientState.api) throw new Error("Please provide a base endpoint to make queries to")

        this.ClientState = {...InitialClientState}

        this.generateModelFunctions()
        this.defineUnionRelationships()
        this.defineModelRelationships()

        const defaultConfig = {
            mock: false,
            debug: true,
            api: FETCH
        }
    }

    generateModelFunctions() {
        const {models} = this.ClientState

        _.forEach(models, (data, name) => {
            const ModelData: ModelDataType | UnionDataType = {...data}

            if (!ModelData.normalizeAs) ModelData.normalizeAs = name
            if (!ModelData.primaryKey) ModelData.primaryKey = "id"

            if (!ModelData._unionDataType) ModelData.normalizrSchema = new Schema(ModelData.normalizeAs)

            this.ClientState.models[name] = ModelData
            this.models[name] = CreateModel(name)
        })
    }

    defineUnionRelationships() {
        const {models} = this.ClientState

        _.forEach(models, (ModelData: ModelDataType | UnionDataType, modelName: String) => {
            // Describe all union normalizr schemas
            if (ModelData._unionDataType) {
                // filter out all non-existing models and warn about them
                const ExistingModels = _.filter(ModelData.models, model => {
                    if (models[model]) return true
                    console.warn(`Model "${model}" on union ${modelName} points to an unknown model`)
                })

                ModelData.normalizrSchema = unionOf(_.map(ExistingModels, model =>
                        ({[model]: models[model].normalizrSchema})),
                    {schemaAttribute: ModelData.schemaAttribute}
                )
            }
        })
    }

    defineModelRelationships() {
        const {models} = this.ClientState

        _.forEach(models, (ModelData: ModelDataType | UnionDataType, modelName: String) => {
            // Describe all model relationships to the normalizr schema
            if (!ModelData._unionDataType) {
                // Filter out all non-model field types
                const ModelFields = _.pickBy(ModelData.fields, (field, fieldName) => {
                    let isArray = false
                    if (Array.isArray(field)) {
                        isArray = true
                        field = field[0]
                    }
                    if (typeof field === 'string' && !isValidType(field)) {
                        if (models[field]) return true
                        console.warn(
                            `Field { ${fieldName}: ${isArray && "["}"${field}"${isArray && "]"} } on '${modelName}' points to an unknown model`
                        )
                    }
                })

                ModelData.normalizrSchema.define(
                    _.mapValues(ModelFields, field => {
                            let isArray = false
                            if (Array.isArray(field)) {
                                isArray = true
                                field = field[0]
                            }

                            const ChildModel: ModelDataType | UnionDataType = models[field]

                            if (isArray) return arrayOf(ChildModel.normalizrSchema)
                            return ChildModel.normalizrSchema
                        }
                    )
                )
            }
        })
    }

    query(...args) {

    }

    mutate(...args) {

    }

    fetch(...args) {

    }
}