import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import path from "path";

// app.isPackaged est la façon fiable de détecter si on est dans un binaire
const isDev = !app.isPackaged;
const NEXT_PORT = 3005;

let mainWindow: BrowserWindow | null = null;

// ─── Démarrage du serveur Next.js (binaire uniquement) ───────────────────────

async function startNextServer(): Promise<void> {
  const nextApp = next({
    dev: false,
    dir: app.getAppPath(), // ← pointe vers la racine de l'app packagée
  });

  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  await new Promise<void>((resolve) => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(NEXT_PORT, () => {
      console.log(`> Next.js server running on http://localhost:${NEXT_PORT}`);
      resolve();
    });
  });
}

// ─── Création de la fenêtre ───────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: "#1a1a2e",
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" as const };
    }
    return { action: "allow" as const };
  });

  mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);

  // DevTools uniquement en dev, jamais dans le binaire
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  if (!isDev) {
    await startNextServer();
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle("get-platform", () => process.platform);
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window-close", () => mainWindow?.close());
