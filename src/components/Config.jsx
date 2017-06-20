/* @flow */
import React from 'react';

export default class Config extends React.Component {
  props: {
    config: {name: string, config: {}}
  };

  render() {
    const {config} = this.props;

    return (
      <div>
        <h3>{config.name}</h3>
        <pre className="config-stub">
          {JSON.stringify(config.config, null, 2)}
        </pre>
      </div>
    );
  }
}
