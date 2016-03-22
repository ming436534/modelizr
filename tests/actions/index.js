import _ from 'lodash'
import { request, prepare } from '../../src/index'
import { book, user } from '../models/index'
import store from '../store/index'

const setup = prepare().debug().spaces(2).path('http://localhost:9000/graphql')

const query = setup.query()
const mutation = setup.mutation()
const mock = setup.getMock()

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
    ).mock().normalize(res => setEntities(res.entities))
}

export const mutateUser = shouldMock => {
    mutation(
        user()
    ).mock(shouldMock).debug().normalize(res => setEntities(res.entities))
}
