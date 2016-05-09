import { _, base, debug } from './utils'
import mock from './mock'

const query = base()
query.Class = class extends query.Class {

    generate() {
        return (this._query = `{${_.mapValid(this._models, model => this.makeQuery(model.build(), this._spaces))}\n}`)
    }

    response() {
        this.generate()

        if (this.valueOf('debug')) {
            debug(this._query, `[query: ${this._models[0]._schema.key}]`)
        }

        return this.callApi(mock)
    }
}

export { query as default, query }