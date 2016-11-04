// @flow
import _ from 'lodash'

import { ModelFunction } from '../types'

export const CreateModel = (newModel): ModelFunction => {
    const Model: ModelFunction = (fieldName: ?String | ?Object | ?ModelFunction,
                                  params: ?Object | ?ModelFunction,
                                  ...models: Array<ModelFunction>) => {

        const NextModel = {...Model}

        if (typeof fieldName === 'string') {
            NextModel.ModelName = fieldName

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

        models.forEach((model: ModelFunction) => NextModel.Children = [...NextModel.Children, model.ModelName])

        return CreateModel(NextModel)
    }

    if (typeof newModel === 'object') {
        _.forEach(newModel, (value, key) => Model[key] = value)
    } else {
        Model.ModelName = newModel
        Model.Params = {}
        Model.Children = []
        Model._isModelizrModel = true
    }

    return Model
}

export default CreateModel