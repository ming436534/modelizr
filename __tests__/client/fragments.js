import {models} from './index'

const {Person, Animal, Cat, Dog} = models

export const PersonWithFriend = Person(
	Person("Friend")
)

export const PersonWithPets = Person(
	Animal("Pets",
		Cat, Dog
	)
)

export const PersonWithPetsWithFriend = PersonWithPets(
	Person("Friend")
)