import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Button from '../components/Button';
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
        </Button>
      </div>

      <h2>Variants</h2>
      <ul>
        {op.variants.map(variant => (
          <li key={variant}>{variant}</li>
        ))}
      </ul>

      <h2>Documentation</h2>
      <article
        className="op-text"
        dangerouslySetInnerHTML={{ __html: op.text }}
      />
    </Layout>
  );
};

export default OpTemplate;
