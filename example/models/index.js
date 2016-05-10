import { unionOf, model } from '../../src/index'

const user = model('users')

const book = model('books', {
    id: {type: 'integer'},
    title: {type: 'string', faker: 'name.firstName'}
})

const collection = unionOf('collections', {
    books: book,
    users: user
}, {schemaAttribute: 'type'})

user.setSchema({
    id: {type: 'integer', alias: 'ID'},
    firstName: {type: 'string', faker: 'name.firstName'},
    lastName: {type: 'string', faker: 'name.lastName'}
})

book.define({
    author: user
})

user.define({
    books: [book],
    collections: [collection]
})

export { book, user, collection }