export default {
	normalizeAs: "Dogs",
	fields: {
		__type: String,
		ID: String,
		name: String,
		breed: {
			type: String,
			pattern: "Lab|Colly"
		},
		Owner: "Person"
	},
	primaryKey: "ID"
}