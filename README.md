## Spck - Termux Plugin

### Installation
  * #### In Termux:
    1. **Unzip** `SpckPlugin.zip` (available in [release](https://github.com/mestery69/SpckTermuxPlugin/releases/tag/v1.0.0-beta.1))
    2. **Copy** the folder into Termux
    3. **Run** `npm i` in Termux
    4. **Run** `npm start` in Termux (in the SpckPlugin folder)
 * #### In Spck or in Browser
    * Browser :
      1. Open http://localhost:3000/ (after launching the server in the Termux side)
    * **OR**
    * Spck :
      1. Go to `index.html` in the TermuxPlugin folder (in this github repo)
      2. Read comments

### Configuration
#### In the Web Terminal (see [this step](https://github.com/mestery69/SpckTermuxPlugin/blob/master/README.md#in-spck-or-in-browser))
Click on gear, enter you Spck project url (for example http://localhost:7700/myproject)
**Warning**: your url musn't contains specials characters as ♤ (for example) so if your url contains specials characters you must url encode your url, [use this tool](https://www.urlencoder.io/) to encode your url, but not encode the host (http://localhost:7700/) just encode the project name, for example i have this: `http://localhost:7700/myproject☆` you copy only `myproject☆` and paste it on the tool, then copy the result and paste it after the host: we get `http://localhost:7700/myproject%E2%98%86` 

Then click on the button with ✅  

And put in the input the files to sync (separated by "|" with their path) for example put this `index.html|css/index.html|js/index.html|path/to/another/file.txt`  

The env input is not yet implemented so you can bypass it

Click save and if you have an alert that indicate you "You must fill at minimum 1 input" you can click ok, and if you don't want to sync files and just you want to use the terminal, click cancel

ℹ Your settings is stored in the localStorage, so when you enter a project url that you have already saved it, it load automatically !!!
> If you need help, come to [Spck Discord](https://discord.gg/WDMHTa6) and ping `Mestery#9999` (id: 282201728097583104) with your question

**Watch** `setup.mp4` & `usage.mp4` (old videos)
