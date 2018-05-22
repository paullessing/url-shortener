import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Main } from './Main';

ReactDOM.render(
  <Main></Main>,
  document.getElementById('react') as Element
);
const loader = document.getElementById('initial-loader') as Element;
(loader.parentElement as Element).removeChild(loader);
