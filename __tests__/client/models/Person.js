export default {
	normalizeAs: "People",
	fields: {
		id: String,
		name: {
			type: String,
			faker: "name.firstName"
		},
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
		licensed: Boolean,
		Pets: ["Animal"],
		Friend: "Person"
	}
}