# Brawl Stars Discord Rich Presence

A small Node.js script that shows your Brawl Stars stats on your Discord profile. It reads your data from the official Brawl Stars API and updates your Discord activity once per half minute, rotating between pages such as:

- **Trophies:** current and highest, plus your highest win streak across all brawlers
- **Ranked:** current rank and elo, plus your all-time peak rank and elo

> **Note:** this project is unofficial and is not endorsed by Supercell or Discord. See [Disclaimer](#disclaimer).

---

## Table of contents

1. [How it works](#how-it-works)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running it](#running-it)
6. [Starting automatically with Windows](#starting-automatically-with-windows)
7. [Customizing](#customizing)
8. [Troubleshooting](#troubleshooting)
9. [Security notes](#security-notes)
10. [Disclaimer](#disclaimer)

---

## How it works

1. The script asks the Brawl Stars API for your player data (trophies, ranked elo, brawler stats).
2. It sends that data to the **Discord desktop app** running on the same computer, which shows it on your profile.
3. It repeats every 30 seconds, alternating between trophies and ranked.

Important notes:

- The **Discord desktop app must be open** on the computer running the script. The Discord website and mobile app cannot receive Rich Presence from outside apps.
- The script only shows what your stats are. It cannot tell whether you currently have the game open.

---

## Requirements

| Requirement | Notes |
| --- | --- |
| [Node.js](https://nodejs.org/en/download) (v18 or newer) | Needed to run the script. v18+ is required because the script uses the built-in `fetch`. |
| Discord desktop app | Must be running and logged in. |
| A Brawl Stars account | You need your player tag. |
| A Brawl Stars API key | Free, created on the Supercell developer site. |

---

## Installation

### 1. Install Node.js

1. Download the **LTS** version from <https://nodejs.org/en/download> and run the installer with the default options.
2. Open a new terminal (Command Prompt, PowerShell or Git Bash) and check it worked:
   ```
   node --version
   npm --version
   ```
   Both should print a version number. Node should be v18 or higher.

### 2. Get the project

Either clone it with Git:

```
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
```

or download the repository as a ZIP from GitHub (**Code > Download ZIP**), extract it, and open a terminal in the extracted folder.

### 3. Install dependencies

In the project folder, run:

```
npm install
```

This reads `package.json` and downloads the libraries the script needs (`discord-rpc` and `dotenv`) into a `node_modules` folder.

---

## Configuration

The script reads its settings from a file called `.env` in the project folder. This file holds secrets and is never uploaded to GitHub.

### 1. Create your `.env` file

- Rename the example file to .env
- Open and add your Brawl Stars API key and player tag
- No need to change client id, keep the default value

Make sure the file is named exactly `.env`. On Windows, file extensions are hidden by default, so check that it is not actually called `.env.txt` (enable **View > File name extensions** in File Explorer).

Your `.env` will contain three values:

```
DISCORD_CLIENT_ID=your_application_id
BRAWL_STARS_API_KEY=your_api_key
BRAWL_STARS_PLAYER_TAG=YOURTAG
```

Formatting rules:

- No spaces around the `=`.
- No quotes needed around values.
- No trailing spaces.
- For the player tag, **leave out the `#`**. In `.env` files `#` starts a comment, so an unquoted `#` can cut the value off. (If you really want it, wrap it in quotes: `"#YOURTAG"`. The script removes a leading `#` either way.)

### 2. Discord application ID (`DISCORD_CLIENT_ID`)

Discord needs an application to attach your activity to. The application's name is what appears as the activity title on your profile.

**Option A: use the ID provided with this project.** Put the application ID given in `.env.example` into `DISCORD_CLIENT_ID`. The ID is public, not a secret, and nothing else needs to be set up. Any images the project uses come from that application.

**Option B: create your own application.**

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Give it a name (for example, "Brawl Stars"). This is the title others will see.
3. On the **General Information** page, copy the **Application ID**.
4. Paste it into `.env` as `DISCORD_CLIENT_ID`.
5. Optional: under **Rich Presence > Art Assets**, upload images. In `index.js`, uncomment `largeImageKey` and set it to the name of your uploaded asset. New assets can take a few minutes to appear.

### 3. Player tag (`BRAWL_STARS_PLAYER_TAG`)

1. Open Brawl Stars and tap your profile.
2. Your tag is shown under your name and starts with `#` (for example `#2PP`).
3. Put it in `.env` without the `#`.

Tags only use these characters: `0289PYLQGRJCUV`. If yours contains an `O` (the letter), it is almost certainly the number `0`.

### 4. Brawl Stars API key (`BRAWL_STARS_API_KEY`)

1. Go to <https://developer.brawlstars.com> and create an account or log in.
2. Open **My Account** and click **Create New Key**.
3. Give it a name and description (anything is fine).
4. In **Allowed IP addresses**, enter your **current public IP address**. You can find it by searching "what is my IP" in a browser. The key only works from the IP address(es) you list here.
5. Create the key, copy it, and paste it into `.env` as `BRAWL_STARS_API_KEY`.

Notes:

- Keys are tied to IP addresses. If your home IP address changes, the API will start rejecting requests (see [Troubleshooting](#troubleshooting)). Edit the key on the developer site and update the allowed IP.
- Use your own key. Do not share it.

---

## Running it

Before starting:

- Open the **Discord desktop app** and wait until it has fully loaded.
- In Discord, go to **User Settings > Activity Privacy** and turn on **Share my activity**.

Then, in the project folder:

```
npm start
```

(or `node index.js`).

You should see:

```
Connected to Discord as <your username>
[time] <details line> | <state line>
```

Open your Discord profile (or ask a friend to look). The presence should appear within a few seconds. Stop the script at any time with `Ctrl + C`.

---

## Starting automatically with Windows

To avoid running the command every time, create a launcher that starts the script when you log in.

1. In the project folder, create a file called `start-rpc.vbs`:
   ```vbs
   Set sh = CreateObject("WScript.Shell")
   WScript.Sleep 20000
   sh.CurrentDirectory = "C:\full\path\to\your\project"
   sh.Run "node index.js", 0, False
   ```
   - Replace the path with the real path to your project folder.
   - `Sleep 20000` waits 20 seconds so Discord has time to start first.
   - The `0` runs the script hidden, with no terminal window.
2. Press `Win + R`, type `shell:startup`, and press Enter.
3. Put a shortcut to `start-rpc.vbs` in the folder that opens.

To stop it, end `node.exe` in Task Manager. To remove auto-start, delete the shortcut from the Startup folder.

Because it runs hidden, you will not see error messages. If the presence stops working, run `npm start` manually to see what is wrong.

---

## Customizing

All the display logic is in the `updatePresence` function in `index.js`.

- **Pages:** the `pages` array holds the two text lines (`details` and `state`) for each page. Add, remove or edit entries to change what is shown. Each line can be up to about 128 characters.
- **Update speed:** change the interval in `setInterval(updatePresence, 60 * 1000)`. Do not go below about 15 seconds, since Discord rate-limits presence updates.
- **Other stats:** the API response includes many more fields, for example `club.name`, `expLevel`, `3vs3Victories`, `soloVictories`, `duoVictories`, and a `brawlers` array with stats per brawler. To see everything available for your account, temporarily add this after `getPlayer()` is defined and run once:
  ```js
  getPlayer().then(p => console.log(JSON.stringify(p, null, 2)));
  ```
  Remove it afterwards, since it prints all of your data.
- **Win streak:** the highest win streak is read from per-brawler fields whose names include "streak". If it shows `?`, check the field name in the JSON output above and update the `bestStreak` function.
- **Images and buttons:** add `largeImageKey` or `buttons` to the `setActivity` call. Image keys must match asset names uploaded in your Discord application.

---

## Troubleshooting

**`Error: connection closed` right after connecting**
Discord accepted the connection and closed it immediately. Try these in order:
1. Fully quit Discord (tray icon > Quit Discord), end any leftover `Discord.exe` processes in Task Manager, then reopen it and wait for it to load.
2. Run Discord and your terminal at the same privilege level. If one runs as administrator and the other doesn't, the connection can be refused.
3. Close any other Discord clients (Canary, PTB) and any other apps that set a Discord activity.
4. Check `DISCORD_CLIENT_ID`. It must be a plain number (about 18 digits) with no quotes or spaces, and the application must exist.

**`Could not connect to Discord`**
Discord is not running, or you are running the browser or mobile version. Open the desktop app and try again.

**`Brawl Stars API 403` (or similar)**
The API rejected your key. Most often your public IP address changed or is not on the key's allowed list. Check your current IP, edit the key on <https://developer.brawlstars.com>, and add the current address. It can also mean the key was copied incorrectly.

**`Brawl Stars API 404`**
The player tag was not found. Check it for typos (and remember `0` is the number zero, not the letter `O`).

**`Brawl Stars API 429`**
Too many requests. Increase the update interval.

**Presence shows nothing, but no errors appear**
- Make sure **Share my activity** is on in Discord's Activity Privacy settings.
- Check that you are not in an invisible status that hides activity.
- You cannot see your own presence in some Discord views. Check your profile card, or ask a friend.

**The player tag or key seems to be ignored**
- The file must be called `.env` (not `.env.txt`) and must be in the folder you run the command from.
- No spaces around `=`, and no `#` unquoted in the value.

**`npm` or `node` is not recognized**
Node.js is not installed or the terminal was opened before installing. Install Node and open a new terminal.

---


## Disclaimer

This material is unofficial and is not endorsed by Supercell. For more information see [Supercell's Fan Content Policy](https://supercell.com/fan-content-policy). Brawl Stars is a trademark of Supercell. Discord is a trademark of Discord Inc.