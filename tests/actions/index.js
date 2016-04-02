import _ from 'lodash'
import { prepare } from '../../src/index'
import { book, user } from '../models/index'
import store from '../store/index'

const setup = (
    prepare({
        requestTo: function (path) {
            return this.apply('_path', `http://localhost:8000/${path}`)
        }
    })
        .debug()
        .spaces(2)
        .path('http://localhost:8000/graphql')
        .headers({ok: 'ok'})
        .error('throw')
)

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

export const requestUsers = (mock, delay, error) => {
    query(
        user(
            book(
                user().as('author')
            )
        )
    )
        .mock(mock)
        .delay(delay)
        .error(error ? 'throw' : false)
        .normalize(res => setEntities(res.entities))
}

export const mutateUser = (mock, delay, error) => {
    mutation(
        user()
    )
        .mock(mock)
        .delay(delay)
        .error(error ? 'throw' : false)
        .then()
}

export const mutateUserAndFetch = (mock, delay, error) => {
    mutation(
        user()
    )
        .mock(mock)
        .delay(delay)
        .error(error ? 'throw' : false)
        .query()
        .normalize(res => setEntities(res.entities))
}

export const plainRequest = (mock, delay, error) => {
    request(
        {
            name: 'john'
        }
    )
        .mock(mock)
        .delay(delay)
        .error(error ? 'throw' : false)
        .headers({
            auth: 'token'
        })
        .requestTo('custom-request')
        .then(res => {
        })
}