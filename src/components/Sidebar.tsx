import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Search from './Search';
import Footer from './Footer';
import logo from '../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const {
    site: { siteMetadata: meta },
  } = useStaticQuery(graphql`
    query SidebarMeta {
      site {
        siteMetadata {
          title
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
          <img src={logo} />
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
      <section className="hidden-mobile">
        <Footer />
      </section>
    </nav>
  );
};

export default Sidebar;
