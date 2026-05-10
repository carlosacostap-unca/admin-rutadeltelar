import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const port = process.env.PORT || '3100';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.PLAYWRIGHT_BASE_URL;
const isWindows = process.platform === 'win32';
const extraArgs = process.argv.slice(2);

const server = shouldStartServer
  ? spawn(
      process.execPath,
      ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', port],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        detached: !isWindows,
      },
    )
  : null;

let shuttingDown = false;

function stopServer() {
  if (shuttingDown || !server?.pid) return;
  shuttingDown = true;

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill('SIGTERM');
  }
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL);
      if (response.ok || response.status < 500) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseURL}${lastError ? ` (${lastError.message})` : ''}`);
}

function runPlaywright() {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['node_modules/@playwright/test/cli.js', 'test', ...extraArgs],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseURL,
          PLAYWRIGHT_SKIP_WEBSERVER: '1',
        },
        stdio: 'inherit',
      },
    );

    child.on('exit', (code, signal) => {
      resolve(signal ? 1 : code ?? 1);
    });
  });
}

try {
  await waitForServer();
  const exitCode = await runPlaywright();
  stopServer();
  process.exit(exitCode);
} catch (error) {
  stopServer();
  console.error(error);
  process.exit(1);
}
