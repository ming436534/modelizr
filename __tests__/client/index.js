import { Modelizr } from '../../src'

import Person from './models/Person'
import Animal from './models/Animal'
import Cat from './models/Cat'
import Dog from './models/Dog'

const {query, mutate, models} = new Modelizr({
	models: {
		Person,
		Animal,
		Cat,
		Dog
	},
	config: {
		endpoint: "http://localhost:8001"
	}
})

export { query, models, mutate }