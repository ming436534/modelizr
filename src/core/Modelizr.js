// @flow
import { Schema, arrayOf } from 'normalizr'
import _ from 'lodash'

import CreateModel from './ModelBuilder'
import { isValidType } from '../tools/TypeMap'
import { ModelFunction } from '../types'

type ModelDataType = {
    normalizeAs: ?String,
    fields: Object,
    primaryKey: ?String,
    normalizrSchema: Schema
}

type ClientStateType = {
    config: {
        endpoint: String,
        headers: ?Object<String>,
        mock: ?Boolean,
        debug: ?Boolean
    },
    models: Object<ModelDataType>
}

export default class Modelizr {

    ClientState: ClientStateType;
    config: ConfigType;

    models: Object<ModelFunction> = {};

    constructor(InitialClientState: ClientDescriptionType) {
        if (!InitialClientState) throw new Error("Modelizr expects a Client State as its first parameter")

        this.ClientState = {...InitialClientState}

        this.generateModelFunctions()
        this.defineRelationships()
    }

    generateModelFunctions() {
        const {models} = this.ClientState

        _.forEach(models, (data, name) => {
            const ModelData: ModelDataType = {...data}

            if (!ModelData.normalizeAs) ModelData.normalizeAs = name
            if (!ModelData.primaryKey) ModelData.primaryKey = "id"

            ModelData.normalizrSchema = new Schema(ModelData.normalizeAs)

            this.ClientState.models[name] = ModelData
            this.models[name] = CreateModel(name)
        })
    }

    defineRelationships() {
        const {models} = this.ClientState

        _.forEach(models, (ModelData: ModelDataType, modelName: String) => {
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

                        const ChildModel: ModelDataType = models[field]

                        if (isArray) return arrayOf(ChildModel.normalizrSchema)
                        return ChildModel.normalizrSchema
                    }
                )
            )
        })
    }
}