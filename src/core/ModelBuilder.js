// @flow
import { normalizeFunctionParameters } from '../tools/Filters'
import _ from 'lodash'

import { ModelFunction } from '../types'

/**
 * Construct a method representation of a model. This method contains
 * no field information but rather config that is used when generating
 * a query.
 *
 * The resulting ModelFunction is an eternity method, meaning the result
 * of calling it is a new ModelFunction that contains the changes to the
 * original.
 */
export const CreateModel = (newModel: Object | string): ModelFunction => {

    /* The ModelFunction that is returned. This stores information for
     * query generation such as the FieldName, ModelName of the data it
     * represents, query parameters and all children models it should
     * generate.
     * */
    const Model: ModelFunction = (fieldName: ?string | ?Object | ?ModelFunction,
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

        /* We want to store the model name and field name
         * separately as the field name can change on a per
         * query basis, while the model name must always
         * remain consistent.
         * */
        Model.ModelName = newModel
        Model.FieldName = newModel

        Model.Params = {}
        Model.Children = []
        Model.Filters = {}

        const setFilter = (key, value) => CreateModel({
            ...Model,
            Filters: {
                ...Model.Filters,
                [key]: value
            }
        })

        /* Model functions that allows for white-listing and
         * black-listing model fields on a per-query basis.
         * */
        Model.only = (fields: Array<string>) => setFilter("only", fields)
        Model.without = (fields: Array<string>) => setFilter("without", fields)
    }

    return Model
}

export default CreateModel