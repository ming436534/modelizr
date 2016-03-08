import { defineSchemas, schema } from '../../src/schema'
import { query } from '../../src/query'
import { mutation } from '../../src/mutation'
import { mock } from '../../src/mock'
import { normalize } from '../../src/normalize'

import { arrayOf } from '../../src/normalize'

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

console.log(q(
    user(
        book().props(['firstname'])
    )
).generate())

//mock(
//    user(
//        book(
//            user().as('author')
//        )
//    ).as('user').params({id: 1})
//).normalize(res => console.log(res))