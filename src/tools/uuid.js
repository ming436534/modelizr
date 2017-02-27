/**
 * A utility that generates a V4 UUID
 */
export const v4 = (): string => {
	let uuid = ''
	for (let i = 0; i < 32; i++) {
		const value = Math.random() * 16 | 0
		if (i > 4 && i < 21 && !(i % 4)) uuid += '-'
		uuid += ((i === 12) ? 4 : ((i === 16) ? (value & 3 | 8) : value)).toString(16)
	}
	return uuid
}