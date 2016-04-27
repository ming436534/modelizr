import { model } from '../../src/index'

export const user = model('users', {
    id: {type: 'integer', alias: 'ID'},
    firstName: {type: 'string', faker: 'name.firstName'},
    lastName: {type: 'string', faker: 'name.lastName'}
})