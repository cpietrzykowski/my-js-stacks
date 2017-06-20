/* @flow */

import React from 'react';
import Config from './Config';

export default class Configs extends React.Component {
  props: {
    configs: Array<{}>
  };

  render() {
    const {configs} = this.props;

    return (
      <fieldset>
        <legend>Configs</legend>
        {configs.map((config, i) => {
          return (
            <Config key={i} config={config} />
          );
        })}
      </fieldset>
    );
  }
}
