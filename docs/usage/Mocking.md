# Mocking

The goal with mocking is to produce data that is structured in the exact same way as an actual GraphQL response.

Lets mock the query for a Person we made in the previous step:

```javascript
query(
  Person({id: 1},
    Animal("Pets"
      Dog, Cat
    )
  )
).mock() // => Appending the 'mock' results in a mocked response
.then((res, normalize) => {
  ...
})
```

Our mocked response will now look something like this:

```javascript
const res = {
  data: {
    Person: {
      id: "05438a43-00e5-4e2d-9720-ecb1bc9093b9",
      firstName: "0bf14db1",
      age: 50123,
      Friend: {
        id: "8a008933-b5c3-4809-aef7-5a3c34c1c3b6",
        firstName: "c6187c73",
        age: 45674
      },
      Pets: [
        {
          __type: "Cat",
          id: "efaaa503-d453-4191-a177-307774d2ab10",
          name: "f0b2b542"
        },
        {
          __type: "Dog",
          id: "6a146a9c-779b-486a-bc13-25b72c6d555e,
          breed: "6a146a9c",
          name: "b245d540"
        },
        ...
      ]
    }
  }
}
```

All the generated data is in the correct format in this example, but it isn't very human readable - for example, the persons name is `0bf14db1`. We can 
improve the quality of the mocked data by adding more information to our models.

```javascript
const Person = {
  normalizeAs: "People",
  fields: {
    id: {
      type: String,
      alias: "ID" // The generated query will contain the alias ID
    },
    firstName: {
      type: String,
      faker: "name.firstName"
    },
    age: {
      type: Number,
      min: 1,
      max: 100
    },
    Friend: "Person", // Reference the 'Person' model as a relationship
    Pets: ["Animal"] // Wrapping a reference in an array indicates a collection
  },
  primaryKey: "id" // Which field to use as the primary key. Defaults to 'id'
}
```

Now when queries are mocked, the data generated will be much more accurate. here is an example of a mocked Person after updating the model:

```javascript
const res = {
  data: {
    Person: {
      id: "05438a43-00e5-4e2d-9720-ecb1bc9093b9",
      firstName: "James",
      age: 32,
      ...
    }
  }
}
```