/* eslint-env node */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..')
const packagesDir = path.join(repoRoot, 'packages')

async function listPackageDirs() {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(packagesDir, e.name))
}

/**
 * @param {string} p
 */
async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'))
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 * @param {import('node:child_process').ExecFileSyncOptions} [opts]
 */
function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

async function main() {
  const pkgDirs = await listPackageDirs()

  /** @type {Array<{name: string, hasTest: boolean}>} */
  const workspaces = []

  for (const dir of pkgDirs) {
    const pkgJsonPath = path.join(dir, 'package.json')
    try {
      const pkg = await readJson(pkgJsonPath)
      const name = pkg?.name
      if (typeof name !== 'string' || !name) continue
      const testScript =
        typeof pkg?.scripts?.test === 'string' ? pkg.scripts.test.trim() : ''
      const hasRealTest =
        !!testScript &&
        // Common npm init placeholder; treat as “no tests”.
        !testScript.includes('no test specified')
      workspaces.push({ name, hasTest: hasRealTest })
    } catch {
      // ignore non-workspace directories
    }
  }

  const targets = workspaces.filter((w) => w.hasTest).map((w) => w.name)

  if (targets.length === 0) {
    console.log('No workspaces have a test script; skipping.')
    return
  }

  for (const name of targets) {
    console.log(`\n## Running tests: ${name}\n`)
    run('yarn', ['workspace', name, 'test'], { cwd: repoRoot })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
