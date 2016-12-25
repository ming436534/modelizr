import { Modelizr } from '../../src'

import User from './models/User'
import Cat from './models/Cat'
import Dog from './models/Dog'

const {query, mutate, models} = new Modelizr({
    models: {
        User,
        Cat,
        Dog
    },
    config: {
        endpoint: "http://localhost:8001"
    }
})

export { query, models, mutate }