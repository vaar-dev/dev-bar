// Prepares dist/ to be published as the package root: rewrites package.json's
// path fields (written relative to the repo root, for local dev / git installs)
// to be relative to dist/ instead, and copies over README/LICENSE. The root
// package.json is left untouched - this only ever writes into dist/.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const stripDistPrefix = (path) => path.replace(/^\.\/dist\//, './')

const distPkg = {
  ...pkg,
  main: stripDistPrefix(pkg.main),
  module: stripDistPrefix(pkg.module),
  types: stripDistPrefix(pkg.types),
  exports: Object.fromEntries(
    Object.entries(pkg.exports).map(([entryPoint, conditions]) => [
      entryPoint,
      Object.fromEntries(
        Object.entries(conditions).map(([condition, path]) => [condition, stripDistPrefix(path)]),
      ),
    ]),
  ),
}
delete distPkg.files

writeFileSync(resolve(root, 'dist/package.json'), `${JSON.stringify(distPkg, null, 2)}\n`)
copyFileSync(resolve(root, 'README.md'), resolve(root, 'dist/README.md'))
copyFileSync(resolve(root, 'LICENSE'), resolve(root, 'dist/LICENSE'))

console.log('Prepared dist/ for publishing')
