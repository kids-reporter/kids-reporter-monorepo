# kids-reporter-monorepo

### Monorepo setup

This is a monorepo containing sub-packages:

- [@kids-reporter/content-api](./packages/content-api): see `packages/content-api`
- [@kids-reporter/draft-renderer](./packages/draft-renderer): see `packages/draft-renderer`
- [@kids-reporter/draft-editor](./packages/draft-editor): see `packages/draft-editor`
- [@kids-reporter/cms-core](./packages/core): see `packages/core`
- [@kids-reporter/cms](./packages/cms): see `packages/cms`
- [@kids-reporter/frontend](./packages/frontend): see `packages/frontend`
- [@kids-reporter/cronjob-rss-feed](./packages/cronjob-rss-feed): see `packages/cronjob-rss-feed`

This monorepo adopts `husky`, `lint-staged` and `yarn workspaces`.
`husky` and `lint-staged` will

1. run eslint for needed sub-packages before `git commit`

`yarn workspaces` will install dependencies of all the sub-packages wisely and effienciently.

### Development

Before modifying sub-packages' source codes, make sure you install dependencies on root.
We need `husky` and `lint-staged` installed first.

### Installation

- Corepack (Yarn v4): ensure Node 20 and run `corepack enable` once on your machine.
- Install deps: `yarn install` (Berry config enforces immutable installs by default).
- CI/Docker: use `yarn install --immutable` to prevent lockfile drift.

### Yarn v4 (Berry) Notes

- This repo uses Yarn v4 with node_modules (`.yarnrc.yml` sets `nodeLinker: node-modules`).
- Yarn is pinned via `packageManager` in `package.json` and resolved by Corepack.
- Subpackage Docker builds copy `.yarnrc.yml` and enable Corepack in the image.

### 如何在 workspaces 中新增 subpkg？

新增 subpkg 的 convention 是在 `${root}/packages/` 底下新增資料夾和檔案，
並且在 root 的 packages.json#workspaces 的 array 中新增 `"packages/${subpkg}"`。

若在同一個 monorepo 中的 subpkgs 之間有相依性，例如：`@kids-reporter/cms` 依賴 `@kids-reporter/cms-core`，而 `@kids-reporter/core` 依賴 `@kids-reporter/draft-editor`，workspaces 能讓你在 local 端使用 soft link 的方式連結到其他的 subpkgs 去；但要注意你在 packages.json 的 dependencies 裡標示的 name 和 version 要正確。

例如：

```
// in packages/cms/package.json

"dependencies": {
  "@kids-reporter/cms-core": "^0.4.35",
}

// in packages/core/package.json
"name": "@kids-reporter/cms-core",
"version": "0.4.35"

```

當 `packages/core/package.json` 的 `name` 和 `version` 與 `packages/cms/package.json` 的 `dependencies`.`@kids-reporter/cms-core` 一樣時，yarn install 並不會額外從 npm registry 下載 `@kids-reporter/cms-core` pkg，反倒是會建立 soft link，讓 `${root}/node_modules/@kids-reporter/cms-core` 指到 `${root}/packages/core` 去。

如此一來，就可以在 local 端一次開發多個 subpkgs。

### 如何update subpkg version

使用@changeset/cli來update版號, ex:

```
yarn update

or

yarn changeset && yarn changeset version
```

### Troubleshootings

#### Q1: 我在 root 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@kids-reporter/(draft-editor|draft-renderer|cms-core|)` 有關，可以嘗試先到 `packages/(draft-editor|draft-renderer|core)` 底下，執行 `yarn build`。

確保 local 端有相關的檔案可以讓 `packages/cms` 載入。
