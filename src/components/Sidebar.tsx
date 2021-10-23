import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Search from './Search';

const Sidebar = () => {
  const {
    site: { siteMetadata: meta },
  } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          author
          description
        }
      }
    }
  `);

  return (
    <nav id="sidebar">
      <section>
        <div id="site-title">
          <Link to="/">{meta.title}</Link>
        </div>
        <div id="site-description">
          <p>{meta.description}</p>
          <p>
            powered by{' '}
            <a href="https://github.com/zneak/x86doc">zneak/x86doc</a>
          </p>
        </div>
      </section>
      <section>
        <Search />
      </section>
      <section>
        <ul>
          <li>
            <a href="#"></a>
          </li>
        </ul>
      </section>
      <section>
        <footer id="footer">
          <p>
            <a href="https://github.com/superhawk610">{meta.author}</a> &middot;
            ⚡ <a href="https://www.gatsbyjs.com">gatsby</a>
          </p>
          <p className="copyright">
            &copy; {new Date().getFullYear()}, all rights reserved
          </p>
        </footer>
      </section>
    </nav>
  );
};

export default Sidebar;
