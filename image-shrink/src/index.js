const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;
let aboutWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: "white",
  });

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
