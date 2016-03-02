import { Schema, defineSchemas } from '../../src/index'

const user = new Schema({
    key: 'users',
    definitions: {
        books: ['book']
    },
    properties: {
        firstName: {type: 'string', faker: 'name.firstName'},
        lastName: {type: 'string', faker: 'name.lastName'},
        email: {type: 'string', format: 'email', faker: 'internet.email'}
    }
})

const book = new Schema({
    key: 'books',
    definitions: {},
    properties: {
        title: {type: 'string', faker: 'name.jobTitle'},
        author: {type: 'string', faker: 'name.jobTitle'},
        price: {type: 'integer', faker: 'finance.amount'},
        negotiable: {type: 'boolean'},
        highlighted: {type: 'boolean'},
        condition: {type: 'string', faker: {'custom.value': 'awesome'}},
        publisher: {type: 'string', faker: 'name.jobTitle'},
        year: {type: 'string', faker: {'custom.value': '1997'}},
        edition: {type: 'string', faker: 'random.number'},
        description: {type: 'string', faker: 'lorem.paragraphs'},
        seller: {type: 'string'},
        images: {type: 'array', items: {type: 'string', faker: 'image.image'}}
    }
})

const notification = new Schema({
    key: 'notifications',
    definitions: {},
    properties: {
        message: {type: 'string'},
        unread: {type: 'boolean'},
        link: {type: 'string'}
    }
})

const event = new Schema({
    key: 'events',
    definitions: {
        prizes: ['prize'],
        qrCodes: ['qrCode'],
        bonusQRCode: 'qrCode',
        scanned: ['qrCode']
    },
    properties: {
        clue: {type: 'string'},
        opened: {type: 'boolean'},
        closed: {type: 'boolean'},
        totalCodes: {type: 'integer'},
        date: {type: 'string'}
    }
})

const qrCode = new Schema({
    key: 'prizes',
    definitions: {
        event: 'event'
    },
    properties: {
        code: {type: 'string'},
        location: {type: 'string'}
    }
})

const prize = new Schema({
    key: 'prizes',
    definitions: {
        winner: 'user'
    },
    properties: {
        description: {type: 'string'}
    },
})

const model = defineSchemas({
    user,
    book,
    notification,
    event,
    prize,
    qrCode
})

export { model as default, model }