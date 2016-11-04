// @flow

export const union = (UnionDescription: Object) => ({
    ...UnionDescription,
    _unionDataType: true
})