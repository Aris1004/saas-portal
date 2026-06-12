const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, screen } = require('electron');

// GPU 가속 — 깜빡임 방지
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-frame-rate-limit');
const { spawn } = require('child_process');
const path = require('path');
const net  = require('net');
const fs   = require('fs');

const PORTAL_DIR    = __dirname;
const SERVER_PY     = path.join(PORTAL_DIR, 'portal_server.py');
const SETTINGS_JSON = path.join(PORTAL_DIR, 'data', 'settings.json');
const PYTHON        = 'C:\\Users\\GAPER\\miniconda3\\python.exe';
const PORT          = 9900;

// 저장된 창 크기 불러오기 (없으면 기본값)
function loadWinSize() {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_JSON, 'utf8').replace(/^﻿/, ''));
    const w = parseInt(s['win-width'],  10);
    const h = parseInt(s['win-height'], 10);
    if(w >= 400 && h >= 200) return [w, h];
  } catch(e) {}
  return [1280, 860];
}

// 창 크기 settings.json에 저장
function saveWinSize(w, h) {
  try {
    let s = {};
    try { s = JSON.parse(fs.readFileSync(SETTINGS_JSON, 'utf8').replace(/^﻿/, '')); } catch(e) {}
    s['win-width']  = w;
    s['win-height'] = h;
    fs.writeFileSync(SETTINGS_JSON, JSON.stringify(s, null, 2), 'utf8');
  } catch(e) {}
}

let splashWin = null;
let mainWin   = null;
let tray      = null;
let serverProc= null;

// ── 포트 열릴 때까지 대기
function waitPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const s = net.createConnection({ port, host: '127.0.0.1' });
      s.once('connect', () => { s.destroy(); resolve(); });
      s.once('error',   () => {
        s.destroy();
        if (Date.now() - start > timeout) reject(new Error('timeout'));
        else setTimeout(check, 400);
      });
    };
    check();
  });
}

// ── 스플래시 창
function createSplash() {
  splashWin = new BrowserWindow({
    width: 420, height: 280,
    frame: false, transparent: false,
    resizable: false, alwaysOnTop: true,
    backgroundColor: '#0a0600',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  splashWin.loadFile('splash.html');
}

// ── 메인 포털 창
function createMain() {
  // 항상 primary 모니터에 열기
  const primary  = screen.getPrimaryDisplay();
  const wx = primary.bounds.x;
  const wy = primary.bounds.y;

  const [savedW, savedH] = loadWinSize();
  mainWin = new BrowserWindow({
    width: savedW, height: savedH,
    x: wx, y: wy,
    minWidth: 400, minHeight: 200,
    show: false,
    title: 'SaaS 포털 — Klimt Golden Tower',
    backgroundColor: '#0a0600',
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'preload.js') }
  });
  mainWin.loadURL(`http://localhost:${PORT}`);
  mainWin.once('ready-to-show', () => {
    splashWin && splashWin.webContents.send('portal-ready');
    setTimeout(() => {
      splashWin && splashWin.close();
      mainWin.show();
      // 실제로 열린 크기를 즉시 저장 (Electron 논리픽셀 기준)
      const [rw, rh] = mainWin.getSize();
      saveWinSize(rw, rh);
    }, 600);
  });
  mainWin.on('closed', () => { mainWin = null; });
  // 창 크기 변경 시 자동 저장 (드래그 포함)
  mainWin.on('resize', () => {
    if(mainWin && !mainWin.isDestroyed()) {
      const [w, h] = mainWin.getSize();
      saveWinSize(w, h);
    }
  });

  // 설정 팝업 → Electron 위젯창 (window.opener 살아있어서 미러링 정상)
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if(url.includes('popup=settings')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500, height: 780,
          frame: false,
          alwaysOnTop: true,
          resizable: true,
          backgroundColor: '#0c0700',
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        }
      };
    }
    // 그 외(서비스 카드 등) → 기본 브라우저
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── 트레이
function createTray() {
  const img = nativeImage.createEmpty();
  tray = new Tray(img);
  tray.setToolTip('SaaS 포털');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '포털 열기', click: () => { mainWin ? mainWin.show() : createMain(); } },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() }
  ]));
  tray.on('click', () => { mainWin ? mainWin.focus() : createMain(); });
}

// ── 앱 시작
app.whenReady().then(async () => {
  createSplash();
  createTray();

  // 이미 9900 포트가 열려있으면 서버 새로 띄우지 않음 (중복 방지)
  const alreadyUp = await new Promise(res => {
    const s = net.createConnection({ port: PORT, host: '127.0.0.1' });
    s.once('connect', () => { s.destroy(); res(true); });
    s.once('error',   () => { s.destroy(); res(false); });
  });

  if (!alreadyUp) {
    serverProc = spawn(PYTHON, [SERVER_PY], {
      cwd: PORTAL_DIR,
      detached: false,
      windowsHide: true
    });
    serverProc.stdout.on('data', d => console.log('[server]', d.toString().trim()));
    serverProc.stderr.on('data', d => console.error('[server]', d.toString().trim()));
  }

  try {
    await waitPort(PORT);
    createMain();
  } catch (e) {
    console.error('포털 서버 시작 실패:', e);
    app.quit();
  }
});

// ── 창 크기 조절 IPC
ipcMain.on('resize-window', (event, w, h) => {
  const nw = Math.max(400, w), nh = Math.max(200, h);
  if(mainWin && !mainWin.isDestroyed()) mainWin.setSize(nw, nh);
  saveWinSize(nw, nh);  // settings.json에 저장 → 다음 실행 시 복원
});
ipcMain.handle('get-window-size', () => {
  if(mainWin && !mainWin.isDestroyed()) return mainWin.getSize();
  return [1280, 860];
});
ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

// ── 종료 시 서버도 같이 종료
app.on('before-quit', () => {
  if (serverProc) { serverProc.kill(); serverProc = null; }
});

app.on('window-all-closed', () => {
  // 트레이로 숨기기 (macOS/Windows 공통)
});
