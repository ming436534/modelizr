import { query } from './client'
import { PersonWithPetsWithFriend } from './client/fragments'

const testNormalization = entities => {
			expect(entities.People).toBeDefined()
			expect(entities.Dogs).toBeDefined()
			expect(entities.Cats).toBeDefined()
}

it("Normalizes query responses correctly", () => {
	return query(PersonWithPetsWithFriend)
		.mock()
		.then((res, normalize) => {
			const {entities} = normalize(res.data)

			testNormalization(entities)
		})
})

it("Normalizes with the .normalize modifier", () => {
	return query(PersonWithPetsWithFriend)
		.mock()
		.normalize(res => {
			testNormalization(res.entities)
		})
})
