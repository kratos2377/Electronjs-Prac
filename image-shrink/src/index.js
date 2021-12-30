const path = require("path");
const os = require("os");
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const slash = require("slash");
const log = require("electron-log");
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;
let aboutWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: isDev ? 800 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.loadFile("./index.html");
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "ImageShrink",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: "white",
  });

  aboutWindow.loadURL(`file://${__dirname}/about.html`);
  //mainWindow.loadFile("./index.html");
}

//One Way
// const menu = [
//   ...(isMac
//     ? [
//         {
//           role: "appMenu",
//         },
//       ]
//     : []),
//   {
//     label: "File",
//     submenu: [
//       {
//         label: "Quit",
//         //U can use any of this
//         // accelerator: isMac ? 'Command+W' : 'Ctrl+W',
//         accelerator: "CmdOrCtrl+W",
//         click: () => app.quit(),
//       },
//     ],
//   },
// ];

// A diff way where we can just add roles instead of defining all tha labels
const menu = [
  ...(isMac
    ? [
        {
          role: "appMenu",
        },
      ]
    : []),
  {
    role: "fileMenu",
  },

  ...(!isMac
    ? [
        {
          label: "About",
          click: createAboutWindow,
        },
      ]
    : []),

  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { role: "seperator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });

    log.info(files);

    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (err) {
    log.error(err);
  }
}

ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageshrink");
  shrinkImage(options);
});

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );

  mainWindow.on("ready", () => (mainWindow = null));
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (isMac) {
    app.quit();
  }
});
