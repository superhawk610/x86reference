module.exports = {
  pathPrefix: '/x86reference',
  siteMetadata: {
    title: 'x86reference',
    description: 'Quickly search x86 assembly documentation.',
    author: 'superhawk610',
    siteUrl: 'https://superhawk610.github.io/x86reference',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          require('postcss-preset-env')({
            stage: false,
            features: { 'nesting-rules': true },
          }),
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /assets\/.*\.svg$/,
        },
      },
    },
  ],
};
