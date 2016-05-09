import { base, debug } from './utils'

const request = base()
request.Class = class extends request.Class {

    constructor(query, mutations) {
        super(null, mutations)
    
        this._mutations = {
            ...this._mutations,
            contentType: 'application/json',
            method: null
        }
    
        this._query = query[0]
    }

    response() {
        if (this.valueOf('debug')) {
            debug(this._query, `[request: ${this.valueOf('path')} <${this.valueOf('method') || 'POST'}>]`)
        }

        if (this.valueOf('mock')) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.valueOf('mockError')) {
                        if (this.valueOf('mockError') == 'throw') {
                            reject(new Error('Mocked Error'))
                        } else {
                            resolve({
                                status: this._error,
                                body: {}
                            })
                        }
                    } else {
                        if (typeof this.valueOf('mock') === 'function') {
                            return resolve(this.valueOf('mock')(this._query))
                        }
                        return resolve(this.valueOf('mock'))
                    }
                }, this.valueOf('mockDelay'))
            })
        }
        return this.valueOf('api')(this._query, {
            ...this._mutations,
            method: this.valueOf('method') ? this.valueOf('method').toUpperCase() : null,
            isPlain: true
        })
    }

    normalize() {
        console.warn('Cannot normalize this request type')
    }

    method = method => this.apply('method', method)
    contentType = type => this.apply('contentType', type)
}

export { request as default, request }