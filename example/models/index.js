import { union, model, alias } from '../../src/index'

const user = model('users')

const book = model('books', {
    id: {type: 'integer'},
    title: {type: 'string', faker: 'name.firstName'}
})

const collection = union('collections', {
    book,
    user
}, {schemaAttribute: entity => entity.lel})

user.setSchema({
    id: {type: 'integer', alias: 'ID'},
    firstName: {type: 'string', faker: 'name.firstName'},
    lastName: {type: 'string', faker: 'name.lastName'},
    statement: {type: 'string', faker: {'custom.statement': [19]}},
    lel: {type: 'schemaAttribute'}
})

book.define({
    author: user
})

user.define({
    books: [book],
    collections: [collection]
})

export { book, user, collection }