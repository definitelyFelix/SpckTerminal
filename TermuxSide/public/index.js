/**
 * This is a beta and the code does not clean...
 * I don't have the time to clean, so i will clean the code after
 * Thanks you.
 * 
 * - Mestery
 * @author Mestery, Proxtx
 */

var terminalOptions = {
  autoRestart: true, // auto reconnect
  command: "bash", // bash or sh
  cwd: "projects", // projects base dir, DONT CHANGE
  env: {} // env variables - coming soon
}; // DON'T CHANGE THIS

var projectSettings = {
  projectPath: null, // the project url
  files: null, // an array of files to sync
  env: null // env variables
}; // DON'T CHANGE THIS

var tty = gritty(document.getElementById("terminal"), terminalOptions);
var term = tty.terminal; // the xterm.js instance
var socket = tty.socket; // socket instance

// global elements
var submitBtn = $("#projectSubmit");
var formSection = $("#opts");
var projectInput = $("#projectPath");
var saveBtn = $("#save");

term.setOption("theme", {
  background: "#1e1e1e",
  foreground: "#b6bcd6",
  selection: "#6f7bb6"
}); // terminal custom theme

term.writeln("\033[94mWelcome to \033[1mSpck - Termux Plugin 👋\033[0m\n"); // welcome message

// -- files sync functions --
function syncFiles() {
  var files = projectSettings.files;
  if (!files || !files.length) return alert("Please specifiy in settings the files to sync");
  animateSync()
  fetch("http://localhost:3000/sync", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: projectSettings.files,
      projectPath: projectSettings.projectPath
    })
  })
  .then(r => r.json())
  .then(r => {
    animateSync(true)
    if (r.status === "OK") return alert("All files are successfully synchronized.")
    if (r.status === "ERROR" && r.error) {
      console.log(r)
      alert("File Sync Failed : " + r.error);
      return;
    }
    console.log(r)
    alert("The following files could not be synchronized\n\n" + JSON.stringify(r.unsyncedFiles, null, 2));
  })
  .catch(e => {
    animateSync(true)
    console.log(e)
    alert("File Sync Failed : " + e)
  })
}
function animateSync(stop) {
  var syncBtn = $("#sync")
  if (stop) {
    syncBtn.removeClass("rotating")
    syncBtn.attr("disabled", false)
    return
  }
  syncBtn.addClass("rotating")
  syncBtn.attr("disabled", true)
}
// ----

// -- project settings function --
function displaySettings(settings) {
  var syncedInput = $("#filesync")
 // var envInput = $("#env")
  //var env = JSON.stringify(settings.env)
  //envInput.val(env === "null" ? "" : env)
  var files = settings.files.join('|')
  syncedInput.val(files === "null" ? "" : files)
}
function getSettings() {
  var syncedInput = $("#filesync").val().trim()
  //var envInput = $("#env").val().trim()
  var projectPath = projectInput.val().trim();
  try {
    return {
      projectPath,
      files: syncedInput ? syncedInput.split("|").map(i => i.indexOf("/") === 0 ? i.replace("/") : i) : null,
      env: null//envInput ? JSON.parse(envInput) : null
    }
  } catch (e) {
    console.log(e)
    alert("Invalid JSON in environment, view logs for details.")
  }
}
function getProjectSettings(projectPath) {
  var id = btoa(projectPath);
  var settings = localStorage.getItem(id);
  if (!settings) return null
  settings = JSON.parse(settings)
  return {
    projectPath: settings.projectPath,
    files: settings.files,
    env: settings.env
  }
};
function saveProjectSettings(settings) {
  localStorage.setItem(btoa(settings.projectPath), JSON.stringify({
    projectPath: settings.projectPath,
    files: settings.files || null,
    env: settings.env || null
  }))
};
// ----

projectInput.on("input", function() {
  if (!submitBtn.hasClass("d-none") && formSection.hasClass("d-none")) return;
  submitBtn.removeClass("d-none"); // display the project url validate button
  formSection.addClass("d-none"); // hide form
  formSection.find("input, textarea").val(""); // reset form value
  for (var i in projectSettings) projectSettings[i] = null; // reset all options
});
submitBtn.on("click", function(e) {
  var projectPath = projectInput.val().trim(); // the project url
  if (!projectPath) return alert("Please specify the project url before validate.");
  if (!/^(https?:\/\/localhost:(102[5-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-9][0-9]{3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-6])\/([0-9a-z\-_~%@#\.&]+)\/?)$/i.test(projectPath)) return alert("The project URL must be in this format : 'http(s)://localhost:PORT/projectname', example: 'http://localhost:7700/myproject'")
  projectSettings = getProjectSettings(projectPath); // get settings from localStorage
  formSection.removeClass("d-none"); // display the form
  submitBtn.addClass("d-none"); // hide the project url validate button
  if (projectSettings) displaySettings(projectSettings);
});
saveBtn.on("click", function () {
  if (formSection.hasClass("d-none")) return alert("Please enter your project path and click ✅ then fill form");
  projectSettings = getSettings();
  if (/*!(projectSettings && projectSettings.env) &&*/ !(projectSettings && projectSettings.files)) return alert("Please fill at least one input or close the modal");
  saveProjectSettings(projectSettings)

  /*if (options.env && !(JSON.stringify(terminalOptions.env) === JSON.stringify(options.env))) {
    Object.assign(terminalOptions.env, options.env) // actually doesnt work
    //socket.emit('terminal', { env: terminalOptions.env, cwd: terminalOptions.cwd, cols: term.cols, rows: term.rows, command: terminalOptions.command, autoRestart: terminalOptions.autoRestart });
  }
  // environments variables - upcoming soon
  */

  $("#settings").modal('toggle') // close the modal
  if (projectSettings.files && projectSettings.files.length) syncFiles() // sync files only if there are files to sync
});
$("#sync").on("click", syncFiles);
