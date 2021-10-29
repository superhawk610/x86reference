import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import './Footer.css';

const Footer = () => {
  const {
    site: { siteMetadata: meta },
  } = useStaticQuery(graphql`
    query FooterMeta {
      site {
        siteMetadata {
          author
        }
      }
    }
  `);

  return (
    <footer className="footer">
      <p>
        created by{' '}
        <a href="https://github.com/superhawk610" target="_blank">
          {meta.author}
        </a>{' '}
        &middot; <a href="https://github.com/superhawk610/x86reference">repo</a>
      </p>
      <p className="copyright">
        &copy; {new Date().getFullYear()}, all rights reserved
      </p>
    </footer>
  );
};

export default Footer;
