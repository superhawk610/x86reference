import React from 'react';
import { Link } from 'gatsby';
import Search from './Search';

const Header = () => (
  <header>
    <h1 style={{ margin: 0 }}>
      <Link to="/">x86reference</Link>
    </h1>
    <Search />
  </header>
);

export default Header;
