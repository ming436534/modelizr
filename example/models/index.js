import { book } from './book'
import { user } from './user'
import { unionOf } from '../../src/index'

book.define({
    author: user
})

const collection = unionOf('collections', {
    books: book
}, {schemaAttribute: 'type'})

user.define({
    books: book,
    collections: [collection]
})

export { book, user, collection }