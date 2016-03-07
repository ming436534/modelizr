import { normalize as Normalize, arrayOf } from 'normalizr'
import { applyMutators, spacer, makeQuery, _, api } from './utils'

const normalize = (response, ...query) => {
    query = _.mapKeys(_.mapValues(query, model => model()), model => model.key)

    return Normalize(response, _.mapValues(query, (entity, key) => {
        if (Array.isArray(response[key])) {
            return arrayOf(entity.model)
        } else {
            return entity.model
        }
    }))
}

export { normalize as default, normalize }