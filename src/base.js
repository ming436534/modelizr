import { _, debug, api } from './utils'
import normalize from './normalize'

class Base {
    constructor(models, opts) {
        this._models = models
        this._spaces = 3
        this._api = api

        _.forEach(opts, (opt, key) => this[key] = opt)
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

        if (params) {
            return ` (${_.filter(_.map(params, (param, key) => param ? `${key}: ${getType(param)}` : null), param => param)})`
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
                return `${currentIndent}${key}`
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
                res,
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

    spaces = spaces => this.apply('_spaces', spaces)
    api = api => this.apply('_api', api)
    path = path => this.apply('_path', path)
    headers = headers => this.apply('_headers', headers)
    debug = debug => this.apply('_debug', debug !== false ? true : false)
    mock = mock => this.apply('_mock', mock !== false ? true : false)
}

export { Base as default, Base }