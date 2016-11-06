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

type ErrorsType = {
    message: string,
    locations: Array<{line: number, column: number}>
}

export class GraphQLError extends Error {

    errors: Array<ErrorsType>;

    constructor(message: string, errors: Array<ErrorsType>) {
        super(message)

        this.errors = errors
    }
}