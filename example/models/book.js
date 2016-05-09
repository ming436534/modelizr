import { model } from '../../src/index'

export const book = model('books', {
    id: {type: 'integer'},
    title: {type: 'string', faker: 'name.firstName'}
})