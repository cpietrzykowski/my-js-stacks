import React from 'react';
import PropTypes from 'prop-types';

export default class Spinner extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    loading: PropTypes.bool
  };

  render() {
    const {loading} = this.props;

    return (
      <div>
        {loading && (
          <div className="spinner"></div>
        ) || (
          this.props.children
        )}
      </div>
    );
  }
}
