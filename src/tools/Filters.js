// @flow
import _ from 'lodash'

import { ModelFunction } from '../types'

/**
 * Checks if a piece of information is a valid data description
 * @param type
 */
export const isValidType = (type: any): Boolean => {
    if (Array.isArray(type)) {
        type = type[0]
    }

    if (typeof type === 'object') {
        if (type.__type) type = type.__type
    }

    const TypeMap = [
        String, "string",
        Number, "number", "integer"
    ]

    return _.find(TypeMap, _type => _type === type)
}

/**
 * Strips a collection of fields of all model relationships
 * @param fields
 */
export const getPlainFields = (fields: Object) =>
    _.pickBy(fields, field => {
        const check = field => typeof field === "object" || isValidType(field)
        if (Array.isArray(field)) return check(field[0])
        return check(field)
    })

type NormalizedParameters = {
    name: String,
    params: Object<any>,
    models: Array<ModelFunction>
}

/**
 * Given three parameters, figure out the type of each param and return
 * a corrected set of parameters.
 *
 * @param name
 * @param params
 * @param models
 * @return {{name: ?String, params: {}, models: [ModelFunction]}}
 */
export const normalizeFunctionParameters = (name, params, models): NormalizedParameters => {
    let trueName,
        trueParams = {},
        trueModels = models

    if (typeof name === 'string') {
        trueName = name

        if (typeof params === 'function') trueModels.unshift(params)
        if (typeof params === 'object') trueParams = params
    } else {
        if (params) trueModels.unshift(params)

        if (typeof name === 'function') trueModels.unshift(name)
        if (typeof name === 'object') trueParams = name
    }

    return {name: trueName, params: trueParams, models: trueModels}
}