import { query, mutate, models } from './client'

const {User, Cat} = models

const testQuery = `query modelizr_query {
  User(id: 1) {
    name,
    Kitten {
      name
    }
  }
}`

const testMutation = `mutation modelizr_mutation {
  User {
    name,
    Cat {
      name
    }
  }
}`

test("Query generation of User and Cat", () => {
    query(User({id: 1}, Cat("Kitten"))).generate(query => {
        expect(query).toEqual(testQuery)
    })
})

test("Mutation generation of User and Cat", () => {
    mutate(User(Cat)).generate(query => {
        expect(query).toEqual(testMutation)
    })
})