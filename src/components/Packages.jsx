import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import Package from './Package';

export default class Packages extends React.Component {
  static propTypes = {
    packages: PropTypes.arrayOf(PropTypes.object),
    onPackagesChanged: PropTypes.func,
    types: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.arrayOf(PropTypes.object)
  };

  render() {
    const {packages, types, value} = this.props;

    return (
      <fieldset>
        <legend>Packages</legend>
        <div>Select the packages to include.</div>

        <button type='button' className='btn btn-primary' onClick={(e) => {
          this.props.onPackagesChanged([]);
        }}>Reset</button> <button type='button' className='btn btn-primary' onClick={(e) => {
          this.props.onPackagesChanged(packages);
        }}>Select All</button>

        <div className="d-flex p-2 flex-column">
          {types.sort(function(l, r) {
            return l.name.localeCompare(r.name);
          }).map((type, i) => {
            const pkgs = packages.filter(function(pkg) {
              return (type.name == pkg.type);
            });

            return (
              <div key={i}>
                <h3>{type.name}</h3>
                <div>{type.description}</div>

                <div className="list-group">
                  {pkgs.sort(function(l, r) {
                    return l.name.localeCompare(r.name);
                  }).map((pkg, i) => {
                    const included = value.some(function(v) {
                      return pkg.name == v.name;
                    });

                    return (
                      <Package key={i} package={pkg} included={included}
                        onClick={(e) => {
                          let newval = value.slice();

                          // toggle logic
                          if (included) {
                            // remove
                            newval = remove(pkg, newval, packages);
                          } else {
                            // add
                            // build new dep list
                            newval = include(pkg, newval, packages);
                          }

                          this.props.onPackagesChanged(newval);
                        }}/>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    );
  }
}

function packageForName(name, pkgs) {
  const pkg = pkgs.find(function(pkg) {
    return pkg.name == name;
  });

  return pkg;
}

function remove(pkg, deps, pkgs) {
  let stack = [pkg]; // prime the stack
  const depset = new Set(deps);

  while (stack.length > 0) {
    const toremove = stack.pop();
    const toremovename = toremove.name;

    depset.forEach(function(dep) {
      const depname = dep.name;

      if (depname == toremovename) {
        depset.delete(dep);
      } else {
        // if any dependencies depend what is being removed
        const depends = dep.dependencies.some(function(dep) {
          return dep == toremovename;
        });

        if (depends) {
          stack.push(dep);
        }
      }
    });
  }

  return Array.from(depset);
}


function include(pkg, deps, pkgs) {
  const stack = [pkg];
  const depset = new Set(deps);

  while (stack.length > 0) {
    const dep = stack.pop();
    const dependencies = dep.dependencies.map(function(name) {
      return pkgs.find(function(pkg) {
        return pkg.name == name;
      });
    }).filter(function(dep) {
      return !depset.has(dep);
    });

    // don't add dependencies to the stack if already satisfied
    stack.push(...dependencies);
    depset.add(dep);
  }

  return Array.from(depset);
}
