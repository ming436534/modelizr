export default {
	normalizeAs: "Dogs",
	fields: {
		__type: String,
		ID: String,
		name: String,
		breed: String,
		Owner: "Person"
	},
	primaryKey: "ID"
}