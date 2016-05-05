import { book } from './book'
import { user } from './user'
import {arrayOf} from '../../src/normalizer'

book.define({
    author: user
})
user.define({
    books: arrayOf(book)
})

export { book } from './book'
export { user } from './user'