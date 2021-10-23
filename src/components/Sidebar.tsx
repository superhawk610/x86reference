import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Search from './Search';
import './Sidebar.css';

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
            <a href="https://github.com/zneak/x86doc" target="_blank">
              zneak/x86doc
            </a>
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
            created by{' '}
            <a href="https://github.com/superhawk610" target="_blank">
              {meta.author}
            </a>{' '}
            &middot;{' '}
            <a href="https://github.com/superhawk610/x86reference">repo</a>
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
