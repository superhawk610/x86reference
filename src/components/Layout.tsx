import React from 'react';
import Sidebar from './Sidebar';
import 'normalize.css';
import './Layout.css';

export interface Props {
  children?: any;
}

const Layout = ({ children }: Props) => (
  <div id="root">
    <Sidebar />
    <main id="main">
      <div id="scroll-wrapper">{children}</div>
    </main>
  </div>
);

export default Layout;
