export default {
	normalizeAs: "People",
	fields: {
		id: String,
		isFunny: Boolean,
		ok: {
			type: [Object],
			properties: {
				prop1: {type: [String]},
				p2: Number
			}
		},
		next: [Object],
		Pets: ["Animal"],
		Friend: "Person"
	}
}