const gritty = require("gritty");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const { join, parse } = require("path");
const chalk = require("chalk");
const download = require("download");

const app = express();
const server = http.createServer(app);

function logger(type, label, sublabel, ...message) {
  sublabel = typeof sublabel !== "string" ? "" : ` ${sublabel}`
  switch (type) {
    case "log":
      label = chalk.bgBlue(label);
      break;
    case "info":
      label = chalk.bgGreen(label);
      type = "info";
      break;
    case "error":
      label = chalk.bgRed(label);
      break;
    case "debug":
      label = chalk.bgCyan(label);
      break;
  }
  console[type](chalk.bold(label + sublabel), ...message)
}

app.use(gritty()) // the terminal middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("cors")({
  credentials: true
}));
app.use("/assets", express.static(join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(join(__dirname, "views", "index.html")); // send the main view
})

app.post("/sync", (req, res) => {
  const files = req.body.files;
  if (!(files && files.length)) return res.json({ status: "ERROR", error: "NO FILES TO SYNC" }); // return error if there are no files to sync
  
  logger("info", "File Sync", "Received Files", files);

  const projectLink = req.body.projectPath;
  const projectName = projectLink.replace(/\/$/, "").split("/"); // remove trailing slash and split to get project name
  
  logger("info", "File Sync", "Received Project URL", projectLink);

  Promise.allSettled(files.map(file => new Promise((resolve, reject) => download(projectLink.replace(projectName[projectName.length - 1], "") + "/" + file, join(__dirname,  "projects", projectName[projectName.length - 1], parse(file).dir), { filename: file }).then(r => resolve({ filename: file, stream: r })).catch(e => reject({ filename: file, error: e }))))).then(files => {
    const unsyncedFiles = (string) => files.filter(promise => promise.status === "rejected").map(promise => ({ [promise.reason.filename]: (string ? String(promise.reason.error) : promise.reason.error) }))
   
    if (unsyncedFiles().length) {
      logger("error", "File Sync", "Download Failed", unsyncedFiles())
      res.json({ status: "ERROR", unsyncedFiles: unsyncedFiles(true) })
    } else {
      logger("log", "File Sync", "Download Successed", files.map(promise => ({ [promise.value.filename]: promise.value.stream })))
      res.json({ status: "OK" })
    }
    
  })
});

gritty.listen(socket.listen(server));
server.listen(3000, () => logger("info", "Server", null, "Listening on port 3000."));
