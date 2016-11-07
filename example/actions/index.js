import client from '../models'

const {models, query, mutate, fetch} = client
const {Person, Dog, Cat, Animal} = models

export const TOGGLE_MOCK = "TOGGLE_MOCK"
export const toggleMock = () => ({
    type: TOGGLE_MOCK
})

export const SET_ENTITIES = "SET_ENTITIES"

export const fetchPeople = () => () => {
    query(
        Person()
    ).then(res => {
        console.log(res)
    })
}