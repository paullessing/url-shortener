import * as React from 'preact';

React.render(
  <Main></Main>,
  document.getElementById('react') as Element
);
const loader = document.getElementById('initial-loader') as Element;
(loader.parentElement as Element).removeChild(loader);
