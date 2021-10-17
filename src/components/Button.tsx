import React from 'react';
import './Button.css';

export interface Props {
  href: string;
  target?: string;
  rel?: string;
  children?: any;
}

const Button = ({ href, target, rel, children }: Props) => (
  <a className="button" href={href} target={target} rel={rel}>
    {children}
  </a>
);

export default Button;
