import React from 'react';
import ajaxFetch from '../lib/ajax-fetch';
import Managers from './Managers';
import Packages from './Packages';
import Spinner from './Spinner';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      managers: [],
      selectedManager: undefined,
      includedPackages: [],
      types: []
    };
  }

  componentDidMount() {
    const defaultManager = 'yarn';
    // load the app data
    ajaxFetch('./data', 'GET', 'json').then(
      (data) => {
        const selectedManager = data.managers.find(function(manager) {
          return manager.name == defaultManager;
        });

        this.setState(
          Object.assign({},
            data,
            {ready: true, selectedManager: selectedManager}
          ));
      },
      (status) => {
        console.info(status);
      });
  }

  render() {
    const {selectedManager, includedPackages, managers, packages,
      ready, types} = this.state;

    return (
      <Spinner loading={!ready} >
        <pre className="package-command-code"><code>{createPackageCommand(selectedManager, includedPackages)}</code></pre>

        <Managers managers={managers}
          onManagerChanged={(manager) => {
            this.setState({
              selectedManager: manager
            });
          }}
          value={selectedManager} />

        <Packages packages={packages}
          onPackagesChanged={(packages) => {
            this.setState({
              includedPackages: packages.sort(function(l, r) {
                return l.name.localeCompare(r.name);
              })
            });
          }}
          value={includedPackages}
          types={types} />

        <p>Package info last updated: {this.state['last-updated']}</p>
      </Spinner>
    );
  }
}

function createPackageCommand(manager, packages) {
  let buffer = '>';

  if (packages.length) {
    const managerCommand = manager.command;
    const devPrompt = 'dev';

    const devPackages = packages.filter(function(pkg) {
      return pkg.development;
    }).map(function(pkg) {
      return pkg.name;
    });

    if (devPackages.length) {
      const devOptions = manager.options.find(function(opt) {
        return opt.type == 'development';
      });

      buffer = `${devPrompt}> ${managerCommand} ${devPackages.join(' ')} ${devOptions.option}`;
    }

    const prodPackages = packages.filter(function(pkg) {
      return !pkg.development;
    }).map(function(pkg) {
      return pkg.name;
    });

    if (prodPackages.length) {

      const prodOptions = manager.options.find(function(opt) {
        return opt.type == 'production';
      });

      buffer += `\n${' '.repeat(devPrompt.length)}> ${managerCommand} ${prodPackages.join(' ')} ${prodOptions.option}`;
    }
  }

  return buffer;
}
