export type ModelFunction = {
    (name: Object | string, params: Object | ModelFunction, models: Array<ModelFunction>): ModelFunction;
    ModelName: string,
    FieldName: string,
    Params: Object,
    Children: Array<string>,
    _isModelizrModel: boolean,
    Filters: ?{
        only: ?Array<string>,
        without: ?Array<string>
    },
    only: (fields: Array<string>) => ModelFunction,
    without: (fields: Array<string>) => ModelFunction
}

export type ModelDataType = {
    normalizeAs: ?string,
    fields: Object,
    primaryKey: ?string,
    normalizrSchema: Object,
    normalizrOptions: ?Object
}

export type UnionDataType = {
    normalizeAs: ?string,
    models: Array<string>,
    schemaAttribute: string | Function,
    _unionDataType: Boolean
}

export type ConfigType = {
    endpoint: string,
    api: Function,
    headers: ?Object<string>,
    method: ?string,
    mock: ?boolean,
    debug: ?boolean,
    body: ?Object,
    throwOnErrors: boolean
}

export type ClientStateType = {
    config: ConfigType,
    models: Object<ModelDataType | UnionDataType>
}