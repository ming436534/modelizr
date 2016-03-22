import { model } from '../../src/index'
import { book } from './book'

export const user = model('users', {
    firstName: {type: 'string', faker: 'name.firstName'}
})

user.define({
    books: [book]
})