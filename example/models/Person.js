export default {
    normalizeAs: "People",
    fields: {
        id: String,
        firstName: String,
        lastName: String,
        age: Number,
        location: {
            latitude: Number,
            longitude: Number
        },
        Pets: ["Animal"]
    }
}