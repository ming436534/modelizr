export type ModelFunction = {
    ModelName: String,
    FieldName: String,
    Params: Object,
    Children: Array<String>,
    _isModelizrModel: boolean
}

export type ModelDataType = {
    normalizeAs: ?String,
    fields: Object,
    primaryKey: ?String,
    normalizrSchema: Object
}

export type UnionDataType = {
    normalizeAs: ?String,
    models: Array<String>,
    schemaAttribute: String | Function,
    _unionDataType: Boolean
}

export type ClientStateType = {
    config: {
        endpoint: String,
        api: Function,
        headers: ?Object<String>,
        mock: ?Boolean,
        debug: ?Boolean
    },
    models: Object<ModelDataType | UnionDataType>
}