// @flow
import { ModelDatatypeField } from '../types'
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
export const generator = (fakerInstance: Object): Function => (field: ModelDatatypeField): any => {
	const {type, faker, pattern} = field

	if (faker) {
		fakerInstance = fakerInstance || createFaker()

		if (!fakerInstance) return generator(fakerInstance)({...field, faker: null})
		return _.result(fakerInstance, faker)
	}

	if (pattern) {
		const options = pattern.split("|")
		const result = _.sample(options)

		if (type === Number) return parseInt(result)
		return result
	}

	switch (type) {
		case String: {
			return v4().substring(0, 10)
		}

		case Number: {
			return _.random(-10000, 10000)
		}

		case Boolean: {
			return !!_.random(1)
		}
	}
}