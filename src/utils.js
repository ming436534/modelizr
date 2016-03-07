import _ from 'lodash'
import * as mutators from './mutators'

const applyMutators = (response, type) => {
    const relevantMutators = {
        ...mutators[`${type}Mutators`],
        ...mutators.sharedMutators
    }
    _.forEach(relevantMutators, (action, name) => response[name] = action(response))

    return response
}

const spacer = amount => _.join(_.map(_.range(0, amount), space => ''), ' ')

_.mapValid = (array, map) => _.map(_.pickBy(array, element => element && element.continue !== false), map)
_.extractMockedObjects = array => {
    let response = {}
    _.forEach(array, element => {
        response = {
            ...response,
            ...element
        }
    })

    return response
}

const makeParams = params => {
    const getType = param => {
        if (Array.isArray(param)) {
            return `[${param}]`
        } else if (typeof param === 'number') {
            return param
        }
        return `"${param}"`
    }

    if (params) {
        return ` (${_.filter(_.map(params, (param, key) => param ? `${key}: ${getType(param)}` : null), param => param)})`
    }
    return ''
}

const makeQuery = (model, spaces = 3, indent = 1) => {
    if (model.continue === false) {
        return undefined
    }
    const mapProps = (props, indent) => {
        const currentIndent = `\n${spacer(spaces * indent)}`
        return _.mapValid(props, (prop, key) => {
            if (prop.model) {
                return makeQuery(prop, spaces, indent)
            }
            if (prop.type == 'object') {
                return makeQuery({
                    ...{
                        key: key
                    },
                    ...prop
                }, spaces, indent)
            }
            return `${currentIndent}${key}`
        })
    }

    const currentIndent = spacer(spaces * indent)

    return `\n${currentIndent}${model.key}${makeParams(model.params)} {${mapProps(model.properties, indent + 1)}\n${currentIndent}}`
}

const api = (path, query) => {

}

export { applyMutators, spacer, makeParams, api, makeQuery, _ }