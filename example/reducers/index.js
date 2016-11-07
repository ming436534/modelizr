import { SET_ENTITIES, TOGGLE_MOCK } from '../actions/index'
import { combineReducers } from 'redux'

const entityReducer = entityType => (state = {}, action) => {
    switch (action.type) {
        case SET_ENTITIES:
            if (action.entity == entityType) {
                return {...state, ...action.collection}
            }
            return state

        default:
            return state
    }
}

const settingsReducer = (state = {
    mock: false
}, action) => {
    switch (action.type) {
        case TOGGLE_MOCK: {
            return {...state, mock: !state.mock}
        }

        default: {
            return state
        }
    }
}

export default combineReducers({
    People: entityReducer('People'),
    Cats: entityReducer('Cats'),
    Dogs:entityReducer('Dogs'),
    Animals: entityReducer('Animals'),
    Settings: settingsReducer
})