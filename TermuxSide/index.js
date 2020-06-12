const gritty = require("gritty");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

const app = express();
const server = http.createServer(app);

const dir = path.join(__dirname, "projects"); // Spck projects dir
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir); // create the projects folder if isn't exists
}

function logger(type, label, sublabel, ...message) {
  label = sublabel ? ` ${label} ` : ` ${label} : `
  switch (type) {
    case "log":
      label = `${chalk.bgBlue(label)} `;
      break;
    case "info":
      label = `${chalk.bgGreen(label)} `;
      type = "info";
      break;
    case "error":
      label = `${chalk.bgRed(label)} `;
      break;
    case "debug":
      label = `${chalk.bgCyan(label)} `;
      break;
  }
  console[type](label + sublabel, ...message)
}

app.use(gritty()) // the terminal middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("cors")({
  credentials: true
}));
app.use("/assets", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html")); // send the main view
})

app.post("/sync", (req, res) => {
  const files = req.body.files;
  if (!(files && files.length)) return res.json({ status: "ERROR", error: "NO FILES TO SYNC" }); // return error if there are no files to sync
  
  logger("info", "File Sync", "Received Files", files)

  const projectLink = req.body.projectPath;
  const projectName = projectLink.replace(/\/$/, "").split("/"); // remove trailing slash and split to get project name

  logger("info", "File Sync", "Received Project URL", projectLink)

  const syncedFiles = files.map(file => {
    let parsed = path.parse(file);
    return new Promise((resolve, reject) => {
      require("download-file")(projectLink + "/" + n, { filename: parsed.base, directory: path.join(__dirname, "projects", projectName[projectName.length - 1], parsed.dir) }, (error, path) => {
        if (error) reject({ filename: file, error });
        else resolve({ filename: file, path }); // the path where the file is downloaded
      });
    });
  });
  Promise.allSettled(syncedFiles).then(files => {
    
    const unsyncedFiles = (string) => files.filter(promise => promise.status === "rejected").map(promise => ({ [promise.reason.filename]: (string ? String(promise.reason.error) : promise.reason.error) }))
    if (unsyncedFiles.length) {
      logger("error", "File Sync", "Download", "Fails : ", unsyncedFiles())
      res.json({ status: "ERROR", unsyncedFiles: unsyncedFiles(true) })
    } else {
      logger("log", "File Sync", "Download", "Paths : ", files.map(promise => ({ [promise.value.filename]: promise.value.path })))
      res.json({ status: "OK" })
    }

  })
});

gritty.listen(socket.listen(server));
server.listen(3000, () => logger("info", "Server", null, "Listening on port 3000."));
