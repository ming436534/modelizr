import { _, base, debug } from './utils'
import mock from './mock'

const mutation = base()
mutation.Class = class extends mutation.Class {

    constructor(models, opts) {
        super(models, opts)

        this._mutationName = 'mutation'
        this._includeQuery = false
    }

    generate() {
        return (
            this._query = `mutation ${this._mutationName} {${_.mapValid(this._models, model => {
                model = model.build()
                if (this._includeQuery) {
                    return this.makeQuery(model, this._spaces)
                }
                return `\n${this.spacer(this._spaces)}${model.key}${this.makeParams(model.params)}`
            })}\n}`
        )
    }

    response() {
        this.generate()

        if (this._debug) {
            debug(this._query, '[mutation]')
        }

        if (this._mock) {
            if (this._includeQuery) {
                return mock(this._models)
                    .delay(this._mockDelay)
                    .error(this._error)
                    .response()
            }
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true)
                }, this._mockDelay)
            })
        }
        return this._api(this._query, {
            path: this._path,
            headers: this._headers
        })
    }

    as = name => this.apply('_mutationName', name)
    query = query => this.apply('_includeQuery', query !== false ? true : false)
}

export { mutation as default, mutation }