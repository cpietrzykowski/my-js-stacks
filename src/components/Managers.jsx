import React from 'react';
import PropTypes from 'prop-types';
import Manager from './Manager';

export default class Managers extends React.Component {
  static propTypes = {
    onManagerChanged: PropTypes.func,
    managers: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.object
  };

  render() {
    const {managers, value} = this.props;

    return (
      <fieldset>
        <legend>Package Managers</legend>
        <div>Select which package manager you prefer.</div>
        {managers.map((manager, i) => {
          return (
            <Manager key={i} manager={manager}
              onValueChanged={(e) => {
                this.props.onManagerChanged(manager);
              }}
              selected={value.name == manager.name} />
          );
        })}
      </fieldset>
    );
  }
}
