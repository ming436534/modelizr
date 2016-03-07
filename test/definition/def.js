function Fetch(query, path) {
    return
}

query(
    book({},
        author().as('author')
    ).only(['title', 'publishedAt']).without(['title']),

    user(
        book().as('book')
    ).params({}).single()
).path('http://...').useApi(Fetch).normalize()

// mutation

mutation(
    user(
        book().as('user')
    ).params({}).single().as('createUser').noProperties()
).name('mutationName')

// mock

mock(
    book()
).normalize()

// manually normalize

normalize(
    response,
    query
)

// validate

validate(
    state, // the current state. Either parent of entities, or entities subtree
    model // result of schemas()
)

// new commands

addToMutation(
    'filter',
    function (by, as) {
        return function (optionsApi) {

        }
    }
)

addToAll()
addToQuery()

// new schema

var model = schemas(
    schema('book', {
        key: 'books', // default dumbly pluralizes schema name
        properties: {
            author: {model: 'user'},
            editions: {model: ['edition']},
            title: {type: 'string', faker: 'job.title'},
            places: {
                type: 'object', properties: {
                    location: {type: 'string'}
                }
            }
        },
        required: ['author', 'places', 'title'], // default includes all properties
        without: ['editions']
    }).useAs('books') // same as key
)

// or

const book = schema('book', {
    key: 'books', // default dumbly pluralizes schema name
    properties: {
        author: user
    }
})

const user = schema('user', {

})

model.getSchema('book | books')
model.getAllSchemas()