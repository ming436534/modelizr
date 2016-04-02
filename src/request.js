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
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this._error) {
                        if (this._error == 'throw') {
                            reject(new Error('Mocked Error'))
                        } else {
                            resolve({
                                status: this._error,
                                body: {}
                            })
                        }
                    } else {
                        if (typeof this._mock === 'function') {
                            return resolve(this._mock(this._query))
                        }
                        return resolve(this._mock)
                    }
                }, this._mockDelay)
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