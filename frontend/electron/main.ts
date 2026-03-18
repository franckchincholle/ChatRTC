import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";
const NEXT_PORT = 3000;

let mainWindow: BrowserWindow | null = null;

// Démarrage du serveur Next.js

async function startNextServer(): Promise<void> {
  const nextApp = next({
    dev: isDev,
    dir: isDev ? __dirname : path.join(process.resourcesPath, "app"),
  });

  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(NEXT_PORT, () => {
    console.log(`> Next.js server running on http://localhost:${NEXT_PORT}`);
  });
}

// Création de la fenêtre Electron

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Sécurité : isole le renderer
      nodeIntegration: false, // Sécurité : pas d'accès Node dans le renderer
      sandbox: false, // Nécessaire pour le preload
    },
    backgroundColor: "#1a1a2e", // Évite le flash blanc au démarrage
    show: false, // Affiche seulement quand prêt
  });

  // Attend que la page soit prête avant d'afficher la fenêtre
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Ouvre les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);

  // Ouvre les DevTools en développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Cycle de vie de l'application

app.whenReady().then(async () => {
  await startNextServer();

  // Attend que le serveur Next.js soit bien démarré
  await new Promise<void>((resolve) => setTimeout(resolve, 1500));

  createWindow();

  // macOS : re-crée la fenêtre si on clique sur l'icône du dock
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitte l'app quand toutes les fenêtres sont fermées
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers

// Exposé via preload : permet au renderer de connaître la plateforme
ipcMain.handle("get-platform", () => process.platform);

// Permet de minimiser / maximiser / fermer depuis l'UI
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window-close", () => mainWindow?.close());
