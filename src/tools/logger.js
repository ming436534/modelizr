// @flow
import _ from 'lodash'

export type Logger = {
	add: (key: string, value: any) => any,
	print: () => any
}

/**
 * A logger utility to help debug and follow individual requests
 */
export const createLogger = (name: string): Logger => {
	const group = []
	const time = Date.now()

	return {
		add: (key, value) => group.push({key, value}),
		print: () => {
			/* eslint-disable */
			if (typeof console.groupCollapsed === 'function') console.groupCollapsed(`${name} [${(Date.now() - time) / 1000}s]`)
			_.forEach(group, ({key, value}) => {
				if (typeof console.groupCollapsed === 'function') console.groupCollapsed(key)
				console.log(value)
				if (typeof console.groupEnd === 'function') console.groupEnd()
			})
			if (typeof console.groupEnd === 'function') console.groupEnd()
			/* eslint-enable */
		}
	}
}