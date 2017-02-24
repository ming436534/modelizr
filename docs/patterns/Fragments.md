# Fragments

A useful pattern when making multiple queries that use the same sequence of models is to pre-define a query fragment. Something like this:

```javascript
const {models, query} = new Modelizr({ ... })

const {Person, Animal, Cat, Dog} = models

const PersonFragment = Person(
  Animal("Pets",
    Dog, Cat
  )
)

query(
  PersonFragment
).then(res => { ... })
```

A fragment can even be executed again without losing it's previous children

```javascript
...

query(
  PersonFragment("People",
    Person("Friend")
  )
)

/* Resulting query will look as follows */
{
  People {
    id,
    name,
    ...,
    Friend {
      id,
      name,
      ...
    },
    Pets {
      ... on Dog {
        __type,
        id,
        breed,
        ...
      },
      
      ... on Cat {
        __type,
        id,
        name,
        ...
      }
    }
  }
}
```