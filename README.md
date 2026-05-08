# Markdown Vault Obsidian Plugin

This is a plugin for Obsidian (https://obsidian.md) to allow you easily publish your vault to Markdown Vault (https://markdownvault.com),
which in turn makes your notes available on a dedicated iOS app (also called Markdown Vault). Your published vault has a special
'sharing link' which you can share with your users so that they can easily download and view your content.

To use the plugin, you'll need to create a free account at https://markdownvault.com. There are also some optional features
such as password protection that requires a paid subscription.



Additional documentation at https://docs.markdownvault.com/obsidian

## Installation

### Manual Installation

- Download latest release
- Extract to .obsidian/plugins/MarkdownVaultObsidianPlugin/
- Restart Obsidian and enable

## Configuration

The plugin needs 2 pieces of information, which you can obtain from your (free) account on https://markdownvault.com.

- Vault UUID (identifies which vault you're publishing to)
- API Key (secret key to authenticate you when publishing)

## Usage

To publish your vault, either click the iPhone icon in your sidebar, or use the `MarkdownVault: Publish` command.

---

## Developer guidelines

Quick starting guide for plugin devs:

- Clone this repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/MarkdownVaultObsidianPlugin` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/MarkdownVaultObsidianPlugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/markdownvault/`.

## Improve code quality with eslint
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- This project already has eslint preconfigured, you can invoke a check by running`npm run lint`
- Together with a custom eslint [plugin](https://github.com/obsidianmd/eslint-plugin) for Obsidan specific code guidelines.
- A GitHub action is preconfigured to automatically lint every commit on all branches.

## Additional links

Main Website: https://markdownvault.com
Documentation: https://docs/markdownvault.com
Privacy Policy: https://markdownvault.com/privacy/
