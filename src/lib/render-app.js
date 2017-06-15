// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';

export default function renderApp(node: any) {
  ReactDOM.render(React.createElement(App, {}), node);
}
