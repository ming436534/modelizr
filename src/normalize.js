import { normalize as Normalize, arrayOf as _arrayOf, valuesOf as _valuesOf, unionOf as _unionOf } from 'normalizr'
import { _ } from './utils'

const normalize = (response, ...query) => {
    query = _.mapKeys(_.mapValues(query, model => model()), model => model.key)

    return Normalize(response, _.mapValues(query, (entity, key) => {
        if (Array.isArray(response[key])) {
            return _arrayOf(entity.model())
        } else {
            return entity.model()
        }
    }))
}

const arrayOf = (model, options) => _arrayOf(model.schema.model, options)
const valuesOf = (model, options) => _valuesOf(model.schema.model, options)
const unionOf = (model, options) => _unionOf(model.schema.model, options)

export { normalize as default, normalize, arrayOf, valuesOf, unionOf }