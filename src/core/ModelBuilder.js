// @flow
import { normalizeFunctionParameters } from '../tools/Filters'
import _ from 'lodash'

import { ModelFunction } from '../types'

export const CreateModel = (newModel): ModelFunction => {
    const Model: ModelFunction = (fieldName: ?String | ?Object | ?ModelFunction,
                                  modelParams: ?Object | ?ModelFunction,
                                  ...childModels: Array<ModelFunction>) => {
        const {name, params, models} = normalizeFunctionParameters(fieldName, modelParams, childModels)
        const NextModel: ModelFunction = {...Model}

        if (name) NextModel.FieldName = name
        NextModel.Params = {...NextModel.Params, ...params}
        models.forEach((model: ModelFunction) => NextModel.Children = [...NextModel.Children, model])

        return CreateModel(NextModel)
    }

    if (typeof newModel === 'object') {
        _.forEach(newModel, (value, key) => Model[key] = value)
    } else {
        Model.ModelName = newModel
        Model.FieldName = newModel
        Model.Params = {}
        Model.Children = []
        Model.Filters = {}
        Model._isModelizrModel = true

        const setFilter = (key, value) => CreateModel({
            ...Model,
            Filters: {
                ...Model.Filters,
                [key]: value
            }
        })

        Model.only = (fields: Array<String>) => setFilter("only", fields)
        Model.without = (fields: Array<String>) => setFilter("without", fields)
    }

    return Model
}

export default CreateModel