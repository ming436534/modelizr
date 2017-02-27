export default {
	normalizeAs: "Cats",
	fields: {
		__type: String,
		id: {
			type: String,
			alias: "ID"
		},
		name: String,
		type: String,
		Owner: "Person"
	},
}