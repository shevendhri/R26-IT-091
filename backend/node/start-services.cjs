const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

async function modelReady(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    const info = await response.json();
    return response.ok && info.message === 'Plan Analyzer ML Service' && info.checkpoint_available === true;
  } catch { return false; }
}

async function start() {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  const root = path.resolve(__dirname, '../..');
  const url = new URL(process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8010');
  process.env.MODEL_SERVICE_URL = url.origin;
  const children = [];
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children.reverse()) {
      if (child.exitCode !== null || !child.pid) continue;
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      } else child.kill('SIGTERM');
    }
    process.exit(code);
  }
  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
  function launch(executable, args, env) {
    const child = spawn(executable, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
    children.push(child);
    child.on('error', error => { console.error(error.message); stop(1); });
    child.on('exit', code => {
      if (!stopping) { console.error(`Service exited (${code}). Stopping this application's services.`); stop(code || 1); }
    });
    return child;
  }
  try {
    if (await modelReady(url.origin)) {
      console.log(`Reusing model service at ${url.origin}; it will remain running when this backend stops.`);
    } else {
      if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.protocol !== 'http:') {
        throw new Error(`Configured model service is not ready: ${url.origin}. Automatic startup supports local HTTP only.`);
      }
      const python = process.env.BLUEPRINT_PYTHON || path.join(root, 'backend', '.venv-training', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
      if (!fs.existsSync(python)) throw new Error(`Python environment missing: ${python}`);
      console.log('Starting clean YOLO model service...');
      launch(python, ['-B', '-u', path.join(root, 'model/main.py')], { ...process.env, PORT: url.port || '80' });
      const deadline = Date.now() + 120000;
      while (!(await modelReady(url.origin))) {
        if (Date.now() > deadline) throw new Error('Model service did not become ready within 120 seconds. Check its output above.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('Model service ready.');
    }
    launch(process.execPath, [path.join(__dirname, 'server.js')], process.env);
    console.log('Starting analyzer backend. Press Ctrl+C to stop services started by this command.');
  } catch (error) { console.error(error.message); stop(1); }
}

module.exports = { modelReady };
if (require.main === module) start();
