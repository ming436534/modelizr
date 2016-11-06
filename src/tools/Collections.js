// @flow

/**
 * A public helper function that adds a union description key
 * to a Data model.
 *
 * @param UnionDescription
 */
export const union = (UnionDescription: Object) => ({
    ...UnionDescription,
    _unionDataType: true
})