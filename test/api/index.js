import model from '../schemas/index'

const api = () => {
    const request = model.buildRequest({
        users: {
            model: 'user',
            params: {
                ids: [1, 2, 3]
            },
            events: {
                model: 'event',
                includes: [{definition: 'prizes', includes: ['winner']}, 'qrCodes', 'bonusQRCode', 'scanned']
            }
        }
    })

    const graphQLQuery = request.getGraphQuery()

    const mockedRequest = request.mock()
    console.log(mockedRequest.users[0].events)
    const normalizedResponse = request.normalize(mockedRequest)
}

export { api as default }