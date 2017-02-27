import Modelizr, { union } from '../../src'

import Person from './Person'
import Cat from './Cat'
import Dog from './Dog'

const client = new Modelizr({
	models: {
		Person,
		Cat,
		Dog,
		Animal: {
			models: ["Cat", "Dog"],
			schemaAttribute: "__type"
		},
	},
	config: {
		endpoint: "http://localhost:8000/graphql",
		mock: true,
		debug: true
	}
})

export default client