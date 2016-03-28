import { base, debug } from './utils'

const request = base()
request.Class = class extends request.Class {

    constructor(query, opts) {
        super(null, opts)

        this._query = query[0]
        this._contentType = 'application/json'
        this._method = null
    }

    response() {
        this.generate()

        if (this._debug) {
            debug(this._query, '[request]')
        }

        if (this._mock) {
            return new Promise((resolve) => {
                resolve(true)
            })
        }
        return this._api(this._query, {
            contentType: this._contentType,
            path: this._path,
            headers: this._headers,
            method: this._method ? this._method.toUpperCase() : null,
            _plainReq: true
        })
    }

    normalize() {
        console.warn('Cannot normalize this request type')
    }

    method = method => this.apply('_method', method)
    contentType = type => this.apply('_contentType', type)
}

export { request as default, request }