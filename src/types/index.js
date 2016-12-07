export type ModelFunction = {
    (name: Object | string, params: Object | ModelFunction, models: Array<ModelFunction>): ModelFunction;
    ModelName: string,
    FieldName: string,
    Params: Object,
    Children: Array<string>,
    Filters: ?{
        only: ?Array<string>,
        without: ?Array<string>,
        empty: ?boolean
    },
    only: (fields: Array<string>) => ModelFunction,
    without: (fields: Array<string>) => ModelFunction,
    empty: () => ModelFunction
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
    _unionDataType: boolean
}

export type ConfigType = {
    endpoint: string,
    api: Function,
    headers: ?{[key: string]: string},
    method: ?string,
    mock: ?boolean | Object,
    debug: ?boolean,
    body: ?Object,
    throwOnErrors: boolean
}

export type ClientStateType = {
    config: ConfigType,
    models: {[key: string]: ModelDataType | UnionDataType}
}

export type RequestResponse = {
    server_response: ?Object,
    data: Object,
    errors: Object,
    entities: ?Object,
    result: ?Object
}

export type RequestFunction = (value: any) => RequestObject

export type RequestObject = {
    api: RequestFunction,
    endpoint: RequestFunction,
    headers: RequestFunction,
    method: RequestFunction,
    mock: RequestFunction,
    debug: RequestFunction,
    body: RequestFunction,
    throwOnErrors: RequestFunction,
    generate: RequestFunction,
    then: (cb: Function) => Promise<RequestResponse>,
    normalize: (cb: Function) => Promise<RequestResponse>,
}