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
        endpoint: "https://"
    }
})

const {models: {User, Friend, Union, Meal}, query, mutate, fetch} = client

// query(
//     User({ids: [1, 2, 3, 4]},
//         Friend("MyFriends"),
//         Meal("myMeals")
//     )
// ).generate(query => console.log(query))

client.mutate(
    // Friend({ids: [1, 2, 3]},
    //     User.without(["id"]),
    //     Union(
    //         User.only(["name", "surname"])
    //     )
    // )
    Meal("Meals",
        User("chef")
    )
).generate(query => console.log(query))
    .normalize(res => {
        console.log(res)
    })