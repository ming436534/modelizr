import modelizr, { union } from 'modelizr'

const User = {
    normalizeAs: "Shops",
    fields: {
        id: String,
        name: String,
        surname: String,
        location: {
            latitude: Number,
            longitude: Number
        }
    },
    primaryKey: "id",
    relationships: {
        Friends: ["Friend"]
    }
}

const Friend = {
    normalizeAs: "Friends",
    fields: {
        id: String
    }
}

const People = union({
    normalizeAs: "People", // defaults to name anyway
    models: ["User", "Friend"],
    schemaAttribute: "__type" // or function
})

const client = new modelizr({
    models: {
        User,
        Friend,
        People
    },
    config: {
        endpoint: "http://localhost:8080/graphql",
        headers: {}
    }
})

const {models, query, mutate, fetch} = client

query(models.User())
    .config({
        User: Array
    })
    .then()