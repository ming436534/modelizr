// @flow

/**
 * A public helper function that adds a union description property
 * to a Data Model.
 */
export const union = (UnionDescription: Object) => {
    if (!UnionDescription.schemaAttribute)
        throw new Error("A union requires a schemaAttribute")

    return {
        ...UnionDescription,
        _unionDataType: true
    }
}

type ErrorsType = {
    message: string,
    locations: Array<{line: number, column: number}>
}

/**
 * An error type that denotes a response containing
 * GraphQL errors
 */
export class GraphQLError extends Error {

    errors: Array<ErrorsType>;

    constructor(message: string, errors: Array<ErrorsType>) {
        super(message)
        this.errors = errors
    }
}