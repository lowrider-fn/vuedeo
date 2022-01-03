const path = require('path');

module.exports = {
    devServer: {
        open: true,
    },

    publicPath: process.env.NODE_ENV === 'production'
        ? 'vuedeo'
        : '/',

    outputDir: path.resolve(__dirname, './docs'),
};
