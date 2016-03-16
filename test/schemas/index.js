import { defineSchemas, schema } from '../../src/schema'
import { query, mutation, mock, request } from '../../src/index'

const book = schema('books', {
    title: {type: 'string'},
    edition: {type: 'integer'}
})
const user = schema('users', {
    title: {type: 'string'}
})

user.define({
    book: book
})
book.define({
    author: user
})

mock(
    user(
        request({id: 1})
    ).params({id: 1})
).debug().normalize(res => console.log(res)).catch(e => console.log(e))