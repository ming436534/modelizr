# Making Queries

Models can be used inside of **query tools** to generate a GraphQL query and send it off to the server.

Lets try use our models we have defined to query a Person, the persons Friend and his Pets.

```javascript
...

const {Person, Dog, Cat, Animal} = models

query(
  Person({id: 1},
    Person("Friend"),

    Animal("Pets"
      Dog, Cat
    )
  )
).then((res, normalize) => {
	...
})
```

Internally this will generate a GraphQL query and post it to the configured endpoint. The query generated will look as follows:

```javascript
query modelizr_query {
  Person(id: 1) {
    id,
    firstName,
    age,
    Friend {
      id,
      firstName,
      age
    },
    Pets: {
      ... on Cat {
        __type,
        id,
        name
      },
      
      ... on Dog {
        __type,
        id,
        breed,
        name
      }
    }
  }
}
```

The actual GraphQL response received might look something like this:

```javascript
const res = {
  data: {
    Person: {
      id: 1,
      firstName: "John",
      age: 20,
      Friend: {
        id: 2,
        firstName: "Jimmy",
        age: 21
      },
      Pets: [
        {
          __type: "Cat",
          id: 1,
          name: "James"
        },
        {
          __type: "Dog",
          id: 3,
          breed: "Labrador",
          name: "Bran"
        },
        ...
      ]
    }
  }
}
```

This is expected, but not something we want to work with. Within our application's state we want to store data in a flat map. Modelizr can do this by 
looking at the model relationships already defined previously. Internally it uses [normalizr](https://github.com/paularmstrong/normalizr) to achieve this. 
Here is how we can normalize our response:

```javascript
...

query(
  Person({id: 1},
    Animal("Pets"
      Dog, Cat
    )
  )
).then((res, normalize) => {
  const {entities, result} = normalize(res.data)
	
  /* And now we can use it in our application */
  store.dispatch({
    type: "SET_ENTITIES",
    payload: entities
  })
})
```

The resulting flattened entities will now look like this:

```javascript
const entities = {
  People: {
    1: {
      id: 1,
      firstName: "John",
      age: 20,
      Friend: 2,
      Pets: [
        { 
          id: 1,
          schema: "Cat"
        },
        {
          id: 3,
          schema: "Dog",
        },
        ...
      ]
     },
     2: {
       id: 2,
       firstName: "Jimmy",
       age: 21
     }
	},
	
	Cats: {
  	  1: {
  	    id: 1,
  	    name: "James"
  	  }
	},
	
	Dogs: {
     3: {
     	 id: 3,
     	 name: "Brad",
     	 breed: "Labrador"
     } 
	}
}
```

Making a mutation is just as simple. Lets try changing a Persons name and age!

```javascript
mutate(
  Person({id: 1, firstName: "James", age: 21})
)
```

This will generate a GraphQL mutation and post it at the configured endpoint:

```javascript
mutation modelizr_query {
  Person(id: 1, firstName: "James", age: 21) {
    id,
    firstName,
    age
  }
}
```

Now on to mocking!