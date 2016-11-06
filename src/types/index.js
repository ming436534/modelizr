export type ModelFunction = {
    ModelName: String,
    FieldName: String,
    Params: Object,
    Children: Array<String>,
    _isModelizrModel: boolean,
    Filters: ?{
        only: ?Array<String>,
        without: ?Array<String>
    },
    only: (fields: Array<String>) => ModelFunction,
    without: (fields: Array<String>) => ModelFunction
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

export type ConfigType = {
    endpoint: String,
    api: Function,
    headers: ?Object<String>,
    mock: ?Boolean,
    debug: ?Boolean,
    body: ?Object
}

export type ClientStateType = {
    config: ConfigType,
    models: Object<ModelDataType | UnionDataType>
}