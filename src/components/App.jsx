import React from 'react';
import ajaxFetch from '../lib/ajax-fetch';
import joinCollection from '../lib/join-collection';
import deepAssign from '../lib/deep-assign';
import Managers from './Managers';
import Configs from './Configs';
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

  collectPackageManagerStatements(manager, packages) {
    const devPrompt = 'dev';
    const prompt = ' '.repeat(devPrompt.length);
    const cmds = [];

    if (manager) {
      const program = manager.program;
      const addCommand = manager.commands.find(function(cmd) {
        return cmd.name == 'add';
      });

      const initCommand = manager.commands.find(function(cmd) {
        return cmd.name == 'init';
      });

      // new project init statement
      cmds.push(
        `${prompt}> ${program} ${initCommand.command}`);

      if (packages.length) {
        const organizedPackages = packages.reduce(function(memo, pkg) {
          if (pkg.development) {
            memo.development.push(pkg.name);
          } else {
            memo.production.push(pkg.name);
          }

          return memo;
        }, {development: [], production: []});

        if (organizedPackages.development.length) {
          const devOptions = addCommand.options.find(function(opt) {
            return opt.type == 'development';
          });
          const devpkgs = organizedPackages.development.sort(function(a, b) {
            return a.localeCompare(b);
          });
          const devcmd = joinCollection(
            ' ', `${devPrompt}>`, program, addCommand.command, devOptions.option, devpkgs.join(' ')
          );
          cmds.push(devcmd);
        }

        if (organizedPackages.production.length) {
          const prodOptions = addCommand.options.find(function(opt) {
            return opt.type == 'production';
          });
          const prodpkgs = organizedPackages.production.sort(function(a, b) {
            return a.localeCompare(b);
          });
          const prodcmd = joinCollection(
            ' ', `${prompt}>`, program, addCommand.command, prodOptions.option, prodpkgs.join(' '));
          cmds.push(prodcmd);
        }
      }
    }

    return cmds.join('\n');
  }

  collectConfigs() {
    const configs = [];
    const stubs = new Map();
    const partials = new Map();

    this.state.includedPackages.forEach(function(pkg) {
      pkg.config.forEach(function(cfg) {
        if (cfg.partial) {
          let content = [];
          if (partials.has(cfg.name)) {
            content = partials.get(cfg.name);
          }

          content.push(cfg.content);
          partials.set(cfg.name, content);
        } else {
          let content = [];
          if (stubs.has(cfg.name)) {
            content = stubs.get(cfg.name);
          }

          content.push(cfg.content);
          stubs.set(cfg.name, content);
        }
      });
    });

    if (stubs.size > 0) {
      // create and return merged config objects
      stubs.forEach(function(content, name) {
        const config = {};

        // attempt to merge multiple stubs (if multiple packages are config
        // 'authorities' the behaviour is largely undefined)
        mergeConfigs(config, ...content);

        if (partials.has(name)) {
          mergeConfigs(config, ...partials.get(name));
        }

        configs.push({name, config});
      });
    }

    return configs;
  }

  render() {
    const {selectedManager, includedPackages, managers, packages,
      ready, types} = this.state;
    const packageManagerStatements = this.collectPackageManagerStatements(selectedManager, includedPackages);
    const configs = this.collectConfigs();

    return (
      <Spinner loading={!ready} >
        <pre className="package-command-code"><code>{packageManagerStatements}</code></pre>

        <Managers managers={managers}
          onManagerChanged={(manager) => {
            this.setState({
              selectedManager: manager
            });
          }}
          value={selectedManager} />

        {configs.length > 0 && (
          <Configs configs={configs} />
        )}

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

function mergeConfigs(target, ...configs) {
  configs.forEach(function(config) {
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        if (target[key] instanceof Object) {
          if (Array.isArray(target[key])) {
            target[key] = target[key].concat(config[key]);
          } else {
            // recurse
            mergeConfigs(target[key], config[key]);
          }
        } else {
          target[key] = config[key];
        }
      }
    }
  });

  return target;
}
