import http from 'http'
import https from 'https'
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const routeTargetsPath = resolve(
  projectRoot,
  'src',
  'features',
  'skeletonMode',
  'routeSkeletonTargets.json',
)
const boneyardCliPath = resolve(
  projectRoot,
  'node_modules',
  'boneyard-js',
  'bin',
  'cli.js',
)

const targetHost = process.env.BONEYARD_HOST ?? '127.0.0.1'
const targetPort = process.env.BONEYARD_PORT ?? '4173'
const baseUrl = process.env.BONEYARD_BASE_URL ?? `http://${targetHost}:${targetPort}`
const captureWaitMs = process.env.BONEYARD_WAIT_MS ?? '1200'

const routeTargets = JSON.parse(readFileSync(routeTargetsPath, 'utf8'))
const capturePaths = Array.from(
  new Set(
    routeTargets
      .map((target) => target.capturePath)
      .filter((capturePath) => typeof capturePath === 'string' && capturePath.length > 0),
  ),
)
const captureUrls = capturePaths.map((capturePath) => new URL(capturePath, baseUrl).toString())

if (captureUrls.length === 0) {
  throw new Error('No route capture paths were defined for Boneyard generation.')
}

const wait = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms))

const probe = (url) =>
  new Promise((resolvePromise) => {
    const requestModule = url.startsWith('https:') ? https : http
    const request = requestModule.get(url, { timeout: 1500 }, (response) => {
      response.resume()
      resolvePromise(true)
    })

    request.on('error', () => resolvePromise(false))
    request.on('timeout', () => {
      request.destroy()
      resolvePromise(false)
    })
  })

const waitForUrl = async (url, timeoutMs = 60000) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (await probe(url)) {
      return
    }

    await wait(1000)
  }

  throw new Error(`Timed out waiting for ${url} to respond.`)
}

const pipeProcessOutput = (child, label) => {
  child.stdout?.on('data', (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`)
  })
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`)
  })
}

const waitForProcess = (child, label) =>
  new Promise((resolvePromise, rejectPromise) => {
    child.on('error', rejectPromise)
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }

      rejectPromise(new Error(`${label} exited with code ${code ?? 'unknown'}.`))
    })
  })

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const shouldLaunchDevServer = !process.env.BONEYARD_BASE_URL
let devServer = null

try {
  if (shouldLaunchDevServer) {
    const devServerCommand = `${npmCommand} run dev -- --host ${targetHost} --port ${targetPort} --strictPort`

    devServer = spawn(devServerCommand, [], {
      cwd: projectRoot,
      env: {
        ...process.env,
        BROWSER: 'none',
      },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    pipeProcessOutput(devServer, 'vite')
    await waitForUrl(baseUrl)
  }

  const buildProcess = spawn(
    process.execPath,
    [
      boneyardCliPath,
      'build',
      ...captureUrls,
      '--no-scan',
      '--force',
      '--wait',
      String(captureWaitMs),
    ],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    },
  )

  await waitForProcess(buildProcess, 'boneyard-js build')
} finally {
  if (devServer && !devServer.killed) {
    devServer.kill()
    await wait(500)
  }
}
