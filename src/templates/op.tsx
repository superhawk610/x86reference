import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Button from '../components/Button';
import Footer from '../components/Footer';
import ExternalLink from '../assets/up-right-from-square-solid.svg';
import './op.css';

export interface Props {
  pageContext: {
    op: {
      id: string;
      href: string;
      text: string;
      variants: string[];
      variant_descriptions: Record<string, string>;
    };
  };
}

const OpTemplate = ({ pageContext: { op } }: Props) => {
  return (
    <Layout>
      <SEO title={op.id} />
      <div className="op-title">
        <h1>{op.id}</h1>

        <Button href={op.href} target="_blank" rel="noreferrer noopener">
          Full Documentation
          <ExternalLink />
        </Button>
      </div>

      <section className="op-variants">
        <h2>Variants</h2>
        <ul>
          {op.variants.map(variant => (
            <li key={variant}>{variant}</li>
          ))}
        </ul>
      </section>

      <section className="op-documentation">
        <h2>Documentation</h2>
        <article dangerouslySetInnerHTML={{ __html: op.text }} />
      </section>

      <section className="hidden-desktop" style={{ marginTop: '3rem' }}>
        <Footer />
      </section>
    </Layout>
  );
};

export default OpTemplate;
