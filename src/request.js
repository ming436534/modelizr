import { _, base, debug } from './utils'
import mock from './mock'

const request = base()
request.Class = class extends request.Class {

    constructor(query, opts) {
        super(null, opts)

        this._query = query
        this._contentType = 'application/json'
        this._method = 'GET'
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
            method: this._method.toUpperCase(),
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