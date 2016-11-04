import _ from 'lodash'

import Modelizr from './core/Modelizr'
import { union } from './tools/Collections'

const client = new Modelizr({
    models: {
        User: {
            fields: {
                name: String,
                surname: String,
                Friends: ["Friend"],
                Unions: ["Union"]
            }
        },
        Union: union({
            models: ["User", "Friend"],
            schemaAttribute: "__type"
        }),
        Friend: {
            fields: {
                id: String
            }
        }
    }
})

console.log(client.models)