// @flow

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