import Modelizr, { union } from './index'

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
        },

        Meal: {
            normalizeAs: "Meals",
            fields: {
                id: String,
                portions: Number
            }
        }
    },
    config: {
        endpoint: "https://api.yumochefs.com/graphql"
    }
})

const {models: {User, Friend, Union, Meal}} = client

client.fetch(
    // Friend({ids: [1, 2, 3]},
    //     User.without(["id"]),
    //     Union(
    //         User.only(["name", "surname"])
    //     )
    // )
    Meal("Meals")
).generate(query => console.log(query))
    .body({query: "{Meals {id}}"})
    .normalize(res => {
        console.log(res)
    })