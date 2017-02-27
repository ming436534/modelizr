import { models, query } from './client'
import { PersonWithFriend, PersonWithPets } from './client/fragments'

const {Person} = models

const personChecks = (person) => {
	expect(person).toBeDefined()

	expect(person.id).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
	expect(typeof person.otherName).toBe("string")

	expect(person.aliases).toHaveLength(4)
	expect(person.aliases).toContain("alias")

	expect(person.age).toBeGreaterThan(0)
	expect(person.age).toBeLessThan(101)
}

it("Generates data with the correct structure and data", () => {
	return query(Person)
		.mock()
		.then(res => {
			return personChecks(res.data.Person)
		})
})

it("Generates child models correctly", () => {
	return query(PersonWithFriend)
		.mock()
		.then(res => {
			const {data: {Person: person}} = res

			personChecks(person)
			personChecks(person.Friend)
		})
})

it("Generates the schemaAttribute for unions", () => {
	return query(PersonWithPets)
		.mock()
		.then(res => {
			expect(res.data.Person.Pets[0].__type).toMatch(/Dog|Cat/)
		})
})