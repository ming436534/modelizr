export default {
    normalizeAs: "People",
    fields: {
        id: String,
        firstName: {__type: String, __faker: "name.firstName"},
        lastName: String,
        age: {__type: Number, __faker: "random.number"},
        location: {
            latitude: Number,
            longitude: Number
        },
        Pets: ["Animal"],
        Friend: "Person"
    }
}