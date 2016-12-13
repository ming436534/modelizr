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
export class GraphQLError {

    graphQLErrors: Array<ErrorsType>;
    message: string;

    constructor(message: ?string, errors: Array<ErrorsType>) {
        this.message = message || "The GraphQL server responded with errors."
        this.graphQLErrors = errors
    }
}