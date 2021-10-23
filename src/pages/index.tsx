import React from 'react';

import Layout from '../components/Layout';
import SEO from '../components/SEO';

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <pre style={{ marginTop: '5.5rem' }}>
      &lt;-- search for an x86 instruction
    </pre>
  </Layout>
);

export default IndexPage;
