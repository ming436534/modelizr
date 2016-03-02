import { Schema, defineSchemas } from '../../src/index'

const user = new Schema({
    key: 'users',
    definitions: {
        books: ['book']
    },
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'},
        avatar: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    faker: 'random.number'
                }
            }
        }
    },
    required: ['firstname', 'lastname']
})

const book = new Schema({
    key: 'books',
    definitions: {
        author: 'user'
    },
    properties: {
        author: {type: 'string', faker: 'name.firstName'}
    },
    required: ['author']
})

const model = defineSchemas({
    user,
    book
})

export { model as default, model }