import { book } from './book'
import { user } from './user'
import { valuesOf } from '../../src/normalizer'

book.define({
    author: user
})
user.define({
    books: valuesOf(book)
})

export { book } from './book'
export { user } from './user'