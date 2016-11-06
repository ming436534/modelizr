// @flow
import _ from 'lodash'

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

export const getPlainFields = (fields: Object) =>
    _.pickBy(fields, field => typeof field === "object" || isValidType(field))