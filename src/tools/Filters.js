// @flow
import _ from 'lodash'

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