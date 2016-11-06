// @flow
import _ from 'lodash'

import { ModelFunction } from '../types'

export const CreateModel = (newModel): ModelFunction => {
    const Model: ModelFunction = (fieldName: ?String | ?Object | ?ModelFunction,
                                  params: ?Object | ?ModelFunction,
                                  ...models: Array<ModelFunction>) => {

        const NextModel: ModelFunction = {...Model}

        if (typeof fieldName === 'string') {
            NextModel.FieldName = fieldName

            if (typeof params === 'function') {
                models.unshift(params)
            }
            if (typeof params === 'object') {
                NextModel.Params = {...NextModel.Params, ...params}
            }
        } else {
            if (params) models.unshift(params)

            if (typeof fieldName === 'function') {
                models.unshift(fieldName)
            }
            if (typeof fieldName === 'object') {
                NextModel.Params = {...NextModel.Params, ...fieldName}
            }
        }

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