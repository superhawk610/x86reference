import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import searchPrompt from '../assets/search_prompt.png';

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <img
      src={searchPrompt}
      className="hidden-mobile"
      style={{
        width: '250px',
        margin: '8rem 0 0 calc(-1 * var(--body-padding))',
      }}
    />
    <section className="hidden-desktop">
      <Footer />
    </section>
  </Layout>
);

export default IndexPage;
