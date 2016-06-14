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
            this._query = `mutation ${this.getModification('mutationName')}${this.makeParams(this.getModification('params'))} {${_.mapValid(this._models, model => {
                model = model.build()
                if (this.getModification('query')) return this.makeQuery(model, this.getModification('spaces'))
                return `\n${this.spacer(this.getModification('spaces'))}${model.key}${this.makeParams(model.params)}`
            })}\n}`
        )
    }

    response() {
        this.generate()

        if (this.getModification('debug')) {
            debug(this._query, `[mutation: ${_.map(this._models, ({_schema: {key}}) => key)}]`)
        }

        return this.callApi(mock)
    }

    as = name => this.applyModification('mutationName', name)
    params = params => this.applyModification('params', params)
    query = query => this.applyModification('query', query === undefined ? true : query)
}

export { mutation as default, mutation }