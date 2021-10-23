const OPS = require('./generated/full.json');

exports.createPages = async ({ actions }) => {
  for (const op of OPS) {
    actions.createPage({
      path: op.id,
      component: require.resolve('./src/templates/op.tsx'),
      context: { op },
    });
  }
};
