import client from '../models'

const {models, query, mutate, fetch} = client
const {Person, Dog, Cat, Animal} = models

export const TOGGLE_MOCK = "TOGGLE_MOCK"
export const toggleMock = () => ({
	type: TOGGLE_MOCK
})

export const SET_ENTITIES = "SET_ENTITIES"

export const fetchPeople = mock => dispatch => {
	query(
		Person("Peoples", {},
			Animal("Pets",
				Cat, Dog
			),
			undefined,
			Person("Friend")
		).without(["ok"])
	).normalize(res => dispatch({
		type: SET_ENTITIES,
		payload: res.entities
	}))
}