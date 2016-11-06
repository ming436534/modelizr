/* eslint-disable */
import Modelizr, { union } from './index'

const client = new Modelizr({
    models: {
        User: {
            normalizeAs: "Users",
            fields: {
                id: String,
                // name: String,
                // surname: String,
                // Friends: ["Friend"],
                // Groups: ["Group"]
            }
        },
        Group: union({
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
        },
        Meal: {
            normalizeAs: "Meals",
            fields: {
                id: String,
                portions: Number,
                chef: "User"
            }
        }
    },
    config: {
        endpoint: "https://api.yumochefs.com/graphql"
    }
})

const {models: {User, Friend, Meal}, query, mutate, fetch} = client

query(
    Meal("Meals",
        User("chef")
    )
)
    .normalize(res => {
        console.log(res)
    })