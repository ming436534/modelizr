import { Schema as NormalizerSchema, arrayOf } from 'normalizr'
import _ from 'lodash'

let jsf = () => ({})
if (!process.env.MODELIZR_CHEAP_MOCK) {
    jsf = require('json-schema-faker')
}

class Schema extends NormalizerSchema {

    constructor(schema, options) {
        if (!schema.key) {
            throw new Error('Schema object must have a key property')
        }
        if (typeof schema.key !== 'string') {
            throw new Error('Schema key must be a string')
        }

        super(schema.key, options)

        this._define = super.define
        this._schema = {
            ...{
                type: 'object',
                required: _.map(schema.properties, (property, key) => key),
                additionalProperties: false
            },
            ...schema
        }
    }

    getProperties() {
        return this._schema.properties
    }

    define(schemas) {
        this._define(_.mapValues(this._schema.definitions, definition => {
            if (Array.isArray(definition)) {
                return arrayOf(schemas[definition])
            }
            if (typeof definition === 'string') {
                return schemas[definition]
            }
            return definition
        }))
    }

    mock(ids) {
        if (ids) {
            if (typeof ids === 'number') {
                return _.set(jsf(this._schema), 'id', ids)
            } else if (Array.isArray(ids)) {
                return _.map(ids, id => _.set(jsf(this._schema), 'id', id))
            }
        } else {
            return jsf(this._schema)
        }
    }
}

export { Schema as default, Schema }