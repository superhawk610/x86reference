import React from 'react';
import Header from './Header';
import 'normalize.css';
import './Layout.css';

export interface Props {
  children?: any;
}

const Layout = ({ children }: Props) => {
  // const data = useStaticQuery(graphql`
  //   query SiteTitleQuery {
  //     site {
  //       siteMetadata {
  //         title
  //       }
  //     }
  //   }
  // `);

  return (
    <>
      <Header />
      <div>
        <main>{children}</main>
        <footer id="footer">
          <p style={{ marginBottom: '0.35rem' }}>
            built by <a href="https://github.com/superhawk610">@superhawk610</a>{' '}
            &middot; powered by <a href="https://www.gatsbyjs.com">Gatsby</a>
          </p>
          <p style={{ fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()}, all rights reserved
          </p>
        </footer>
      </div>
    </>
  );
};

export default Layout;
