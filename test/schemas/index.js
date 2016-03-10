import { defineSchemas, schema } from '../../src/schema'
import { query, mutation, request } from '../../src/index'

const book = schema('books', {

    title: {type: 'string'},
    edition: {type: 'integer'}

})
const user = schema('users', {
    properties: {
        title: {type: 'string'}
    }
})

user.define({
    books: [book]
})

const q = query.setSpaces(2)

q(
    request().as('makeRequest').normalizeAs('templates')
).mock().debug().normalize(res => console.log(res))