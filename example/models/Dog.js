export default {
	normalizeAs: "Dogs",
	fields: {
		__type: String,
		ID: Number,
		name: String,
		breed: String,
		Owner: "Person"
	},
	primaryKey: "ID"
}