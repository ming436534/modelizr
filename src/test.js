import _ from 'lodash'

import Modelizr from './core/Modelizr'

const client = new Modelizr({
    models: {
        User: {
            fields: {
                name: String,
                surname: String,
                Friends: ["Friend"]
            }
        },
        Friend: {
            fields: {
                id: String
            }
        }
    }
})

console.log(client.ClientState.models.User)