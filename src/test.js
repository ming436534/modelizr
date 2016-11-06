import _ from 'lodash'

import Modelizr from './core/Modelizr'
import { union } from './tools/Collections'
import generate from './core/QueryGeneration'

const client = new Modelizr({
    models: {
        User: {
            fields: {
                id: String,
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
                id: String,
                name: {__type: String, __faker: "number"},
                location: {
                    latitude: Number
                }
            }
        }
    },
    config: {
        endpoint: "http://"
    }
})

console.log(generate({
    ClientState: client.ClientState,
    queryModels: [client.models.Friend({lol: "awsome", hello: {ok: "ok"}}, client.models.User.without(["id"]), client.models.Union(client.models.User))],
    queryType: "query",
    queryParams: {ok: "ok"}
}))