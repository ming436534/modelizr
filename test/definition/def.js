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