---

# Telegram Query ID Bot

Welcome to the Telegram Query ID Bot – your quick and easy way to grab bulk Query IDs from multiple Telegram accounts at once! This Node.js script lets you manage multiple Telegram accounts for any Mini Apps bot. You can log in using OTP (phone code) or by loading a session file, and then get the Query ID from all accounts in one go (all stored in a single TXT file per bot). Use these Query IDs in your other mini app bot scripts however you like!

## What It Does

- **Multi-Account Support:** Login via phone or session file so you can use as many accounts as you want.
- **WebView Request:** Request a WebView from your chosen bot and extract its Query ID.
- **Bulk Data:** All Query IDs from your accounts are collected in one file (e.g., if you use `@JettonFarmingBot`, all IDs go into `JettonFarmingBot.txt`). If an account does a new request, its Query ID gets updated in that file.

## Folder Structure

```
Telegram-Query-ID-Bot/
├── index.js           # The main script file
├── .env.example       # Example env file (copy this to .env)
├── README.md          # This readme file!
├── sessions/          # Sessions folder (created automatically)
└── webview_results/   # Folder to save your Query ID results (created automatically)
```

> **Note:** Create your own `.env` file (don’t commit it!) based on `.env.example` and add your API_ID and API_HASH from Telegram.

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mirai-web3/Telegram-Query-ID-Bot.git
   cd Telegram-Query-ID-Bot
   ```

2. **Install Dependencies:**

   Make sure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. **Setup Your Environment:**

   - Copy `.env.example` to `.env`:
     
     ```bash
     cp .env.example .env
     ```
     
   - Open `.env` and add your API_ID and API_HASH from [my.telegram.org](https://my.telegram.org/auth).

4. **Run the Script:**

   ```bash
   node index.js
   ```

## How to Use

When you run the script, you'll see a menu like this:

```
1. Login with phone number
2. Login with session file
3. Request WebView for all accounts
4. Logout and exit
Please select an option (1/2/3/4):
```

- **Login Options:** Choose option 1 to log in with your phone number (OTP) or option 2 to use an existing session file.
- **Request WebView:** Choose option 3. Then, enter the bot peer (e.g., `@YourBot` such as `@JettonFarmingBot` or `@PAWSOG_bot`) and the WebView URL (e.g., `https://t.me/YourBot?start=ref_xyz...`). The script will then grab the Query ID from each account and combine them in a single TXT file (with one Query ID per line). If an account does a new request, its Query ID will update in that file.
- **Logout:** Option 4 logs out all accounts and exits the program.

## Getting Your API Credentials

1. Log in to [my.telegram.org](https://my.telegram.org/auth).
2. Go to "API development tools" and fill out the form to create a new Telegram App.
3. Get your API_ID and API_HASH from there. For more help, check out the [official guide](https://core.telegram.org/api/obtaining_api_id).

## Educational Purposes Only

This script is for educational and research purposes only. The creators and contributors aren’t responsible for any misuse. Use it at your own risk!

---
