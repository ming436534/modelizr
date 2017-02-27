import { models, query, mutate } from './client'
import { PersonWithFriend, PersonWithPets, PersonWithPetsWithFriend } from './client/fragments'

const {Person} = models

test("Query generation for Model with children", () => {
	query(PersonWithFriend).generate(query => {
		expect(query).toMatchSnapshot()
	})
})

test("Query generation for Model with a Union", () => {
	query(PersonWithPets).generate(query => {
		expect(query).toMatchSnapshot()
	})
})

test("Query generation for a modified fragment", () => {
	query(PersonWithPetsWithFriend).generate(query => {
		expect(query).toMatchSnapshot()
	})
})

test("Query generation for query and Model with parameters", () => {
	const model = PersonWithFriend({id: 1, arrayParameter: [1, "2"]})
	const queryParams = {parameter: 1, nestedParameter: {stringParameter: ""}}

	query(queryParams, model).generate(query => {
		expect(query).toMatchSnapshot()
	})

	test("Mutation query generation", () => {
		mutate(queryParams, model).generate(query => {
			expect(query).toMatchSnapshop()
		})
	})
})

test("Query generation for model using .only", () => {
	query(Person.only(["id"])).generate(query => {
		expect(query).toMatchSnapshot()
	})
})

test("Query generation for model using .without", () => {
	query(Person.without(["name"])).generate(query => {
		expect(query).toMatchSnapshot()
	})
})

test("Query generation for model using .empty", () => {
	query(Person.empty()).generate(query => {
		expect(query).toMatchSnapshot()
	})
})