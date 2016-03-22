import _ from 'lodash'
import { prepare } from '../../src/index'
import { book, user } from '../models/index'
import store from '../store/index'

const setup = prepare().debug().spaces(2).path('http://localhost:8000/graphql')

const query = setup.query()
const mutation = setup.mutation()
const request = setup.request()

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
    ).mock(shouldMock).normalize(res => setEntities(res.entities))
}

export const mutateUser = shouldMock => {
    mutation(
        user()
    ).mock(shouldMock).then()
}

export const mutateUserAndFetch = shouldMock => {
    mutation(
        user()
    ).mock(shouldMock).query().normalize(res => setEntities(res.entities))
}

export const plainRequest = shouldMock => {
    request(
        {
            name: 'awesome'
        }
    ).mock(shouldMock).then(res => {})
}