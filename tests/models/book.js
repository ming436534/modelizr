import { model } from '../../src/index'

export const book = model('books', {
    title: {type: 'string', faker: 'name.firstName'}
})