import _ from 'lodash'
import { prepare } from '../../src/index'
import { book, user, collection } from '../models/index'
import store from '../store/index'

const setup = (
    prepare({
        requestTo: apply => path => apply('path', `http://localhost:8000/${path}`)
    })
        .debug()
        .spaces(2)
        .path('http://localhost:8000/graphql')
        .headers({ok: 'ok'})
        .error('throw')
        .mockConfig({
            extensions: {
                faker: faker => {
                    faker.custom = {
                        statement: length => {
                            return faker.name.firstName() + " has " + faker.finance.amount() + " on " + faker.finance.account(length) + ".";
                        }
                    }
                    return faker
                }
            },
            jsfOptions: {},
            quantity: 20
        })
)

const {query, mutation, request} = setup.get()

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
            book(),
            collection(
                user()
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
        .as("createUser")
        .params({admin: true})
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
        user()
    )
        .mock(mock)
        .delay(delay)
        .error(error ? 'throw' : false)
        .headers({
            auth: 'token'
        })
        .requestTo('custom-request')
        .body({
            name: 'john'
        })
        .then((res, normalize) => {
            console.log(normalize(res.body))
        })
}