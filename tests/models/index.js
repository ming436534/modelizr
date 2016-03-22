import { book } from './book'
import { user } from './user'

book.define({
    author: user
})
user.define({
    books: [book]
})

export { book } from './book'
export { user } from './user'