import { book } from './book'
import { user } from './user'
import { unionOf } from '../../src/index'
import {valuesOf} from '../../src/normalizer'

book.define({
    author: user
})

const collection = unionOf('collections', {
    books: book,
    users: user
}, {schemaAttribute: 'type'})

user.define({
    books: book,
    collections: [collection]
})

export { book, user, collection }