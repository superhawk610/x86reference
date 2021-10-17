import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Button from '../components/Button';

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
      <h1>{op.id}</h1>

      <ul>
        {op.variants.map(variant => (
          <li key={variant}>{variant}</li>
        ))}
      </ul>

      <article dangerouslySetInnerHTML={{ __html: op.text }} />
      <Button href={op.href} target="_blank" rel="noreferrer noopener">
        Full Documentation
      </Button>
    </Layout>
  );
};

export default OpTemplate;
