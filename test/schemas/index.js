import { defineSchemas, schema } from '../../src/schema'
import { query } from '../../src/query'
import { mutation } from '../../src/mutation'
import { mock } from '../../src/mock'
import { normalize } from '../../src/normalize'

const book = schema('book', {
    properties: {
        title: {type: 'string'},
        edition: {type: 'integer'}
    }
})
const user = schema('user', {
    properties: {
        books: {model: ['book']},
        title: {type: 'string'}
    }
})



defineSchemas(
    book,
    user
)


const models =

    (
        user(
            book(

            ).params({ids: [1, 2]})
        ).params({ids: [1, 2], name: 'John'})
    )


const q =


    mock(
        models
    ).getQuery()


const n =

    normalize(
        q,
        models
    )


console.log(n.entities.users, n.entities.books)