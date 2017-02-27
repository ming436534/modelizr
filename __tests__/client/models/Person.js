export default {
	normalizeAs: "People",
	fields: {
		id: String,
		name: String,
		otherName: {
			type: String,
			alias: "middleName"
		},
		aliases: {
			type: [String],
			quantity: 4,
			pattern: "alias"
		},
		age: {
			type: Number,
			min: 1,
			max: 100
		},
		Pets: ["Animal"],
		Friend: "Person"
	}
}