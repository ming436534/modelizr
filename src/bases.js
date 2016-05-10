import { _, debug, api } from './utils'
import normalize from './normalizer'

class QueryMutators {
    constructor(target) {
        this._mutations = {
            spaces: 3,
            mockDelay: 0,
            mockError: false,
            query: true,
            api
        }
        
        this._this = target || this
    }

    apply = (key, value) => {
        this._this._mutations[key] = value
        return this._this
    }
    valueOf = key => {
        return this._this._mutations[key]
    }
    
    spaces = spaces => this.apply('spaces', spaces)
    api = api => this.apply('api', api)
    path = path => this.apply('path', path)
    headers = headers => this.apply('headers', {...this.valueOf('headers'), ...headers})
    debug = debug => this.apply('debug', debug === undefined ? true : debug)
    mock = mock => this.apply('mock', mock === undefined ? true : mock)
    delay = delay => this.apply('mockDelay', delay || 500)
    error = error => this.apply('error', error === undefined ? 'throw' : error)
    custom = func => func(this.apply, this.valueOf)
}

class QueryBase extends QueryMutators {
    constructor(models, mutations) {
        super()

        this._models = models
        this._mutations = {
            ...this._mutations,
            ...mutations
        }

        _.forEach(mutations.custom, (mutator, key) => this[key] = mutator(this.apply, this.valueOf))
    }

    spacer(amount) {
        return _.join(_.map(_.range(0, amount), () => ''), ' ')
    }

    makeParams(params) {
        const getType = param => {
            if (Array.isArray(param)) {
                return `[${param}]`
            } else if (typeof param === 'number') {
                return param
            }
            return `"${param}"`
        }

        if (!_.isEmpty(params)) {
            return `(${_.filter(_.map(params, (param, key) => param ? `${key}: ${getType(param)}` : null), param => param)})`
        }
        return ''
    }

    makeQuery(model, spaces = 3, indent = 1) {
        const mapProps = (props, indent) => {
            const currentIndent = `\n${this.spacer(spaces * indent)}`
            return _.mapValid(props, (prop, key) => {
                if (prop.model) {
                    return this.makeQuery(prop, spaces, indent)
                }
                if (prop.type == 'object') {
                    return this.makeQuery({
                        ...{
                            key: key
                        },
                        ...prop
                    }, spaces, indent)
                }
                return `${currentIndent}${key}${prop.alias ? `: ${prop.alias}` : ''}`
            })
        }

        const currentIndent = this.spacer(spaces * indent)

        return `\n${currentIndent}${model.key}${this.makeParams(model.params)} {${mapProps(model.properties, indent + 1)}\n${currentIndent}}`
    }

    then(cb) {
        cb = cb || function() {
            }

        return this.response().then(res => {
            if (this.valueOf('debug')) {
                debug(res, '[response]')
            }

            return res
        }).then(cb)
    }

    normalize(cb) {
        cb = cb || function() {
            }

        return this.response().then(res => {
            if (this.valueOf('debug')) {
                debug(res, '[response]')
            }
            const response = normalize(
                res.body,
                ...this._models
            )
            if (this.valueOf('debug')) {
                debug(response, '[normalized response]')
            }
            return response
        }).then(cb)
    }

    response() {
        return this._models
    }

    generate() {
        return '{}'
    }
    
    callApi(mock) {
        if (this.valueOf('mock')) {
            if (this.valueOf('query')) {
                return mock(this._models)
                    .delay(this.valueOf('mockDelay'))
                    .error(this.valueOf('mockError'))
                    .response()
            }
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true)
                }, this.valueOf('mockDelay'))
            })
        }
        return this.valueOf('api')(this._query, this._mutations)
    }
}

class ModelBase {
    build() {
        const _build = {
            ...this._schema,
            properties: {
                ...this._schema.properties,
                ..._.mapKeys(_.mapValues(this._models, model => model.build()), model => model.key)
            }
        }

        if (_.size(_build.properties)) {
            _build.type = 'object'
        }

        return _build
    }

    apply(key, value) {
        this._schema[key] = value
        return this
    }

    as = key => this.apply('key', key)
    params = params => this.apply('params', params)
}

export { ModelBase, QueryBase, QueryMutators }