## o.5.0 (April 27th 2016)

+ `breaking` Removed auto-id functionality from models
+ Added functionality to specify the primary key of a model by:
    + `primaryKey()` mutator
    + `{type: 'primary'}` schema definition
    + `primaryKey: 'property'` schema definition
+ Added support for aliasing in GraphQL requests by adding an `{alias: 'ID'}` definition to a property