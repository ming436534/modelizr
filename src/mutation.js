import { _, base, debug } from './utils'
import mock from './mock'

const mutation = base()
mutation.Class = class extends mutation.Class {

    constructor(models, opts) {
        super(models, opts)

        this._mutations = {
            ...this._mutations,
            mutationName: 'mutation',
            query: false,
            params: {}
        }
    }

    generate() {
        return (
            this._query = `mutation ${this.valueOf('mutationName')}${this.makeParams(this.valueOf('params'))} {${_.mapValid(this._models, model => {
                model = model.build()
                if (this.valueOf('query')) {
                    return this.makeQuery(model, this.valueOf('spaces'))
                }
                return `\n${this.spacer(this.valueOf('spaces'))}${model.key}${this.makeParams(model.params)}`
            })}\n}`
        )
    }

    response() {
        this.generate()

        if (this.valueOf('debug')) {
            debug(this._query, `[mutation: ${this._models[0]._schema.key}]`)
        }

        return this.callApi(mock)
    }

    as = name => this.apply('mutationName', name)
    params = params => this.apply('params', params)
    query = query => this.apply('query', query === undefined ? true : query)
}

export { mutation as default, mutation }