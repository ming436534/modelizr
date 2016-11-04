import _ from 'lodash'

import CreateModel from './core/CreateModel'

const A = CreateModel("ModelA")
const B = CreateModel("ModelB")

console.log(A(B))

console.log(A)
console.log(B)