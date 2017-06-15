import React from 'react';
import ajaxFetch from '../lib/ajax-fetch';
import PropTypes from 'prop-types';

export default class Manager extends React.Component {
  static propTypes = {
    manager: PropTypes.object,
    onValueChanged: PropTypes.func,
    selected: PropTypes.bool
  };

  render() {
    const {manager, selected} = this.props;
    const {name, url} = manager;

    return (
      <div className="form-check">
        <label className="form-check-label">
          <input className="form-check-input" type="radio"
            name="managers" id={name}
            value={name} checked={selected}
            onChange={this.props.onValueChanged} />
          <span
            data-toggle="tooltip"
            data-placement="right"
            title={`${manager.command}`}>{name}</span> <a href={url}
            target='_blank' rel='noopener noreferrer'>{url}</a>
        </label>
      </div>
    );
  }
}
