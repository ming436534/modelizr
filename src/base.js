import { _, debug, api } from './utils'
import normalize from './normalizer'
import { forEach } from 'lodash'

class Base {
    constructor(models, opts) {
        this._models = models
        this._spaces = 3
        this._api = api
        this._mockDelay = 0
        this._error = false

        _.forEach(opts, (opt, key) => {this[key] = opt})
        this.applyCustom()
    }

    apply(key, value) {
        this[key] = value
        return this
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
        if (model.continue === false) {
            return undefined
        }
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
        cb = cb || function () {
            }

        return this.response().then(res => {
            if (this._debug) {
                debug(res, '[response]')
            }

            return res
        }).then(cb)
    }

    normalize(cb) {
        cb = cb || function () {
            }

        return this.response().then(res => {
            if (this._debug) {
                debug(res, '[response]')
            }
            const response = normalize(
                res.body,
                ...this._models
            )
            if (this._debug) {
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

    applyCustom() {
        _.forEach(this._custom, (mutator, key) => this[key] = mutator)
    }
}

const mutators = {
    spaces: function (spaces) {
        return this.apply('_spaces', spaces)
    },
    api: function (api) {
        return this.apply('_api', api)
    },
    path: function (path) {
        return this.apply('_path', path)
    },
    headers: function (headers) {
        return this.apply('_headers', {...this._headers, ...headers})
    },
    debug: function (debug) {
        return this.apply('_debug', debug !== false ? true : false)
    },
    mock: function (mock) {
        return this.apply('_mock', mock === undefined ? true : mock)
    },
    delay: function(delay) {
        return this.apply('_mockDelay', delay || 500)
    },
    custom: function (custom) {
        return this.apply('_custom', {...this._custom, ...custom})
    },
    error: function(error) {
        return this.apply('_error', error === undefined ? 'throw' : error)
    }
}

forEach(mutators, (mutator, key) => Base.prototype[key] = mutator)

export { Base as default, Base, mutators }