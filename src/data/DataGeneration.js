// @flow
import { v4 } from '../tools/uuid'
import _ from 'lodash'

let createFaker = () => {
	// eslint-disable-next-line no-console
	console.warn("Faker has been stripped from the production build")
	return false
}
if (process.env.NODE_ENV !== 'production') createFaker = () => require('faker')

/* Generate some fake information based on the type of a field.
 * If the field type is an object, then we handle first the
 * __faker case, and second the __pattern case.
 *
 * if the __faker property is set, generate fake information
 * using fakerjs.
 *
 * If the __pattern property is set, split the property by the
 * delimiter "|" and select one of the resulting strings
 * */
export const generator = (fakerInstance: Object): Function => (type: any): any => {
	if (typeof type === 'object') {
		const {__type, __faker, __pattern} = type

		if (__faker) {
			const faker = fakerInstance || createFaker() // check if a faker instance has been provided in config
			if (!faker) return generator(fakerInstance)(__type)
			return _.result(faker, __faker)
		}

		if (__pattern) {
			const options = __pattern.split("|")
			const result = _.sample(options)
			switch (type) {
				case Number:
				case "number": {
					return parseInt(result)
				}
			}
			return result
		}

		return generator(fakerInstance)(__type)
	} else {
		switch (type) {
			case String:
			case "string": {
				return v4().substring(0, 10)
			}

			case Number:
			case "integer":
			case "number": {
				return _.random(-10000, 10000)
			}

			case "float": {
				return _.random(-10000, 10000, true)
			}

			case Boolean:
			case "boolean": {
				return !!_.random(1)
			}
		}
	}
}