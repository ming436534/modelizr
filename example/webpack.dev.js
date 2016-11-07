module.exports = {
    devtool: 'cheap-module-source-map',
    entry: [
        'babel-polyfill',
        `${__dirname}/app/app.js`
    ],
    output: {
        path: '/',
        filename: 'app.js',
        publicPath: '/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel?presets=react'],
                exclude: /node_modules/
            }
        ]
    }
}