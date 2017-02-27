export default {
	normalizeAs: "People",
	fields: {
		id: String,
		isFunny: Boolean,
		age: {
			type: Number,
			decimal: true,
			min: 1,
			max: 100
		},
		ok: {
			type: [Object],
			properties: {
				prop1: {type: [String], quantity: 1},
				p2: Number
			}
		},
		Pets: {type: ["Animal"], quantity: 20},
		Friend: "Person"
	}
}