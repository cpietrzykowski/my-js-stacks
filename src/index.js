// @flow
import './styles/index.scss';
import 'bootstrap';
import 'tether';
import $ from 'jquery';

import renderApp from './lib/render-app';

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

renderApp(document.getElementById('app'));
