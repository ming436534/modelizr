import model from '../schemas/index'

const api = () => {
    const request = model.buildRequest({
        users: {
            model: 'user',
            type: 'mutation',
            params: {
                ids: [1, 2, 3]
            },
            books: {
                model: 'book'
            }
        }
    })

    const graphQLQuery = request.getGraphQuery()
    console.log(graphQLQuery)
    /*
     {
         users(ids: [1,2,3]) {
             firstname,
             lastname,
             books() {
                author
             }
         }
     }
     */

    const mockedRequest = request.mock()
    /*
     {
     users: [
              {
                firstname: 'Samanta',
                lastname: 'Murphy',
                id: 1,
                books: [
                         {
                           author: 'Angelica',
                           id: 1
                         }
                       ]
              }
            ]
     }
     */

    const normalizedResponse = request.normalize(mockedRequest)
    /*
     {
         entities: {
                    users: { '1': [Object], '2': [Object], '3': [Object] },
                    books: { '1': [Object] }
                   },
         result: {
                    users: [ 1, 2, 3 ]
                 }
     }
     */
}

export { api as default }