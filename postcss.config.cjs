module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*', '!font-size'],
      selectorBlackList: ['.ignore-rem'],
      exclude: /node_modules/i,
    },
  },
};
