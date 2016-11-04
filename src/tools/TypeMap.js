// @flow
import _ from 'lodash'

export const isValidType = (type: any): String => {
    if (Array.isArray(type)) {
        type = type[0]
    }

    const InstanceTypeMap = [
        [String, "string"],
        [Number, "integer"],
        [Date, "date"]
    ]

    const StringTypeMap = [
        "string",
        "integer",
        "date"
    ]

    // Field is already in a correct form
    if (typeof type === "string") {
        switch (type) {
            case "number": {
                return "integer"
            }
            default: {
                if (_.find(StringTypeMap, StringType => StringType == type)) {
                    return type
                }
                return false
            }
        }
    }

    const typeInMap = _.find(InstanceTypeMap, ([_type]) => _type === type)
    if (typeInMap) return typeInMap[1]

    return false
}