import _ from 'lodash'

export const combineReducers = reducers => (state, action) => {
    const combine = (reducers, state) => {
        return {
            ...state,
            ..._.mapValues(reducers, (value, key) => {
                if (typeof value === 'function') {
                    return value(state ? state[key] : state, action)
                } else {
                    return combine(reducers[key], state ? state[key] : undefined)
                }
            })
        }
    }

    return combine(reducers, state)
}

export { combineReducers as default, combineReducers }