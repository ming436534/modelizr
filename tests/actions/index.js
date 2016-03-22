import _ from 'lodash'
import { query, mutation, request } from '../../src/index'
import { book, user } from '../models/index'
import store from '../store/index'

export const SET_ENTITIES = "SET_ENTITIES"
const setEntities = entities => {
    _.forEach(entities, (collection, entity) => {
        store.dispatch({
            type: SET_ENTITIES,
            entity,
            collection
        })
    })
}

export const requestUsers = shouldMock => {
    query(
        user(
            book()
        )
    ).mock().debug().normalize(res => setEntities(res.entities))
}

export const mutateUser = shouldMock => {
    mutation(
        user()
    ).mock(shouldMock).debug().normalize(res => setEntities(res.entities))
}
