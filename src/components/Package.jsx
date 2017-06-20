import React from 'react';
import PropTypes from 'prop-types';

export default class Package extends React.Component {
  static propTypes = {
    package: PropTypes.object,
    included: PropTypes.bool,
    onClick: PropTypes.func
  };

  render() {
    const {included, package: pkg} = this.props;
    const {notes} = pkg;
    const {description, homepage, latest, license} = pkg.details;
    const wrapperClasses = [
      'list-group-item-action', 'list-group-item'
    ];
    included && wrapperClasses.push('active');

    return (
      <div className={wrapperClasses.join(' ')} onClick={this.props.onClick}>
        <div className="d-flex w-100 justify-content-between">
          <div><h5 id={pkg.name}>{pkg.name} <small>{latest} {license}</small></h5></div>
          <div>
            <a href={homepage} target='_blank' rel='noopener noreferrer'>{homepage}</a>
          </div>
        </div>

        <div className="d-flex w-100 justify-content-between">
          <p>{description}</p>
        </div>

        {(notes) &&
          <div className="d-flex w-100 justify-content-between">
            <p>{notes}</p>
          </div>
        }

        {(pkg.dependencies.length > 0) &&
          <div className="d-flex w-100">
            <p>
                <span>Dependencies: {pkg.dependencies.map(function(dep, i) {
                  return (
                    <a key={i} href={`#${dep}`}>{dep}</a>
                  );
                }).reduce(function(memo, cur) {
                  return [memo, ', ', cur];
                })}</span>
            </p>
          </div>
        }
      </div>
    );
  }
}
