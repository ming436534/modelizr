export default {
    normalizeAs: "Cats",
    fields: {
        __type: String,
        id: {__type: String, __alias: "ID"},
        name: String,
        type: String,
        Owner: "Person"
    },
}