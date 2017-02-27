export default {
	normalizeAs: "People",
	fields: {
		id: String,
		name: String,
		age: {
			type: Number,
			min: 1,
			max: 100
		},
		Pets: ["Animal"]
	}
}