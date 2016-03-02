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
    console.log(graphQLQuery)

    const mockedRequest = request.mock()
    const normalizedResponse = request.normalize(mockedRequest)
}

export { api as default }