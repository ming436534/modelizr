import model from '../schemas/index'

const api = () => {
    const request = model.buildRequest({
        user: {
            model: 'user',
            params: {
                ids: 1
            }
        },
        events: {
            model: 'event'
        }
    })

    const graphQLQuery = request.getGraphQuery()

    const mockedRequest = request.mock()
    console.log(mockedRequest.user)
    const normalizedResponse = request.normalize(mockedRequest)
}

export { api as default }