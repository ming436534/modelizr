import { base, debug } from './utils'
import mock from './mock'

const request = base()
request.Class = class extends request.Class {

    constructor(models, mutations) {
        super(models, mutations)

        this._mutations = {
            ...this._mutations,
            contentType: 'application/json',
            method: 'POST'
        }
    }

    response() {
        if (this.valueOf('debug')) {
            debug(this.valueOf('body'), `[request: ${this.valueOf('path')} <${this.valueOf('method') || 'POST'}>]`)
        }

        return this.callApi(mock, this.valueOf('body'))
    }

    method = method => this.apply('method', (method || 'POST').toUpperCase())
    contentType = type => this.apply('contentType', type)
    body = body => {
        if (typeof body === 'object') body = JSON.stringify(body)
        return this.apply('body', body)
    }
}

export { request as default, request }