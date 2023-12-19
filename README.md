Certainly! Sprucing up the repository with a touch of style and emojis can make it more engaging. Here's a revised version of the README with added emojis:

```markdown
# MetaMask Browser Extension 🌐

Hey! We are hiring JavaScript Engineers! [Apply here](https://boards.greenhouse.io/consensys/jobs/2572388)! 🚀

---

You can find the latest version of MetaMask on [our official website](https://metamask.io/). For help using MetaMask, visit our [User Support Site](https://metamask.zendesk.com/hc/en-us). 🤝

For [general questions](https://community.metamask.io/c/learn/26), [feature requests](https://community.metamask.io/c/feature-requests-ideas/13), or [developer questions](https://community.metamask.io/c/developer-questions/11), visit our [Community Forum](https://community.metamask.io/). 💬

MetaMask supports Firefox, Google Chrome, and Chromium-based browsers. We recommend using the latest available browser version. 🌐

For up-to-the-minute news, follow our [Twitter](https://twitter.com/metamask) or [Medium](https://medium.com/metamask) pages. 📰

To learn how to develop MetaMask-compatible applications, visit our [Developer Docs](https://metamask.github.io/metamask-docs/). 👩‍💻👨‍💻

To learn how to contribute to the MetaMask project itself, visit our [Internal Docs](https://github.com/MetaMask/metamask-extension/tree/develop/docs). 🛠️

## Building locally 🛠️

- Install [Node.js](https://nodejs.org) version 14
    - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn](https://yarnpkg.com/en/docs/install)
- Install dependencies: `yarn setup` (not the usual install command)
- Copy the `.metamaskrc.dist` file to `.metamaskrc`
    - Replace the `INFURA_PROJECT_ID` value with your own personal [Infura Project ID](https://infura.io/docs).
    - If debugging MetaMetrics, you'll need to add a value for `SEGMENT_WRITE_KEY` [Segment write key](https://segment.com/docs/connections/find-writekey/).
- Build the project to the `./dist/` folder with `yarn dist`.

Uncompressed builds can be found in `/dist`, compressed builds can be found in `/builds` once they're built. 🏗️

See the [build system readme](./development/build/README.md) for build system usage information.

## Contributing 🤝

### Development builds 🚀

To start a development build (e.g. with logging and file watching) run `yarn start`.

To start the [React DevTools](https://github.com/facebook/react-devtools) and [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension)
  alongside the app, use `yarn start:dev`.
  - React DevTools will open in a separate window; no browser extension is required
  - Redux DevTools will need to be installed as a browser extension. Open the Redux Remote Devtools to access Redux state logs. This can be done by either right-clicking within the web browser to bring up the context menu, expanding the Redux DevTools panel and clicking Open Remote DevTools OR clicking the Redux DevTools extension icon and clicking Open Remote DevTools.
    - You will also need to check the "Use custom (local) server" checkbox in the Remote DevTools Settings, using the default server configuration (host `localhost`, port `8000`, secure connection checkbox unchecked)

[Test site](https://metamask.github.io/test-dapp/) can be used to execute different user flows. 🧪

### Running Unit Tests and Linting 🧹

Run unit tests and the linter with `yarn test`.

To run just unit tests, run `yarn test:unit`. To run unit tests continuously with a file watcher, run `yarn watch`.

You can run the linter by itself with `yarn lint`, and you can automatically fix some lint problems with `yarn lint:fix`. You can also run these two commands just on your local changes to save time with `yarn lint:changed` and `yarn lint:changed:fix` respectively. 🚦

### Running E2E Tests 🌐

Our e2e test suite can be run on either Firefox or Chrome. In either case, start by creating a test build by running `yarn build:test`.

Firefox e2e tests can be run with `yarn test:e2e:firefox`.

Chrome e2e tests can be run with `yarn test:e2e:chrome`, but they will only work if you have Chrome v79 installed. Update the `chromedriver` package to a version matching your local Chrome installation to run e2e tests on newer Chrome versions. 🚀

### Changing dependencies 🔄

Whenever you change dependencies (adding, removing, or updating, either in `package.json` or `yarn.lock`), there are various files that must be kept up-to-date. 📦

* `yarn.lock`:
  * Run `yarn setup` again after your changes to ensure `yarn.lock` has been properly updated.
* The `allow-scripts` configuration in `package.json`
  * Run `yarn allow-scripts auto` to update the `allow-scripts` configuration automatically. This config determines whether the package's install/postinstall scripts are allowed to run. Review each new package to determine whether the install script needs to run or not