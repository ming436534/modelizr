// @flow
import _ from 'lodash'

export default (type: any): String => {
    if (Array.isArray(type)) {
        type = type[0]
    }

    const TypeMap = [
        [String, "string"],
        [Number, "integer"],
        [Date, "date"]
    ]

    // Field is already in a correct form
    if (typeof type === "string") {
        switch (type) {
            case "number": {
                return "integer"
            }
            default: {
                return type
            }
        }
    }

    const typeInMap = _.find(TypeMap, ([_type]) => _type === type)
    if (typeInMap) return typeInMap[1]

    throw new Error("Unknown type provided in model")
}