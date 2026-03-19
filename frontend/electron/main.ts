import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";
const NEXT_PORT = 3005;

let mainWindow: BrowserWindow | null = null;

// ─── Démarrage du serveur Next.js (binaire uniquement) ───────────────────────

async function startNextServer(): Promise<void> {
  const nextApp = next({
    dev: false,
    dir: path.join(process.resourcesPath, "app"),
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // En dev : Next.js tourne déjà via "next dev -p 3005"
  // En prod (binaire) : Next.js est démarré par startNextServer()
  mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // En dev, Next.js est déjà lancé par concurrently → on ne le redémarre pas
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
