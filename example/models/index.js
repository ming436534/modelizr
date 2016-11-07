import Modelizr, { union } from '../../src'

import Person from './Person'
import Cat from './Cat'
import Dog from './Dog'

const client = new Modelizr({
    models: {
        Person,
        Cat,
        Dog,
        Animal: union({
            normalizeAs: "Animals",
            models: ["Cat", "Dog"],
            schemaAttribute: "__type"
        }),
    },
    config: {
        endpoint: "http://localhost:8000/graphql",
        mock: true
    }
})

export default client