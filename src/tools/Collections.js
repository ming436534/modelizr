// @flow

/**
 * A public helper function that adds a union description property
 * to a Data Model.
 *
 * @param UnionDescription
 */
export const union = (UnionDescription: Object) => ({
    ...UnionDescription,
    _unionDataType: true
})