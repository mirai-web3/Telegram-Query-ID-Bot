/*!
 * Telegram Query ID Bot
 * Released under the MIT License.
 * 
 * This script is provided "as is", without warranty of any kind.
 * You are free to use, modify, and distribute it as permitted under the MIT License.
 */

require('dotenv').config();

const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const intro = 'Telegram Query ID Bot';
const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

const accounts = new Map();

const webviewData = {};

async function loginWithPhoneNumber() {
    const phoneNumber = await askQuestion("Please enter your phone number (e.g., +1234567890): ");
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

    await client.start({
        phoneNumber: async () => phoneNumber,
        phoneCode: async () => await askQuestion("Please enter the code you received: "),
        password: async () => await askQuestion("Please enter your password (if required): "),
        onError: (error) => console.error("Error:", error),
    });

    console.log('Logged in successfully');

    const sessionString = client.session.save();
    const sessionFolder = 'sessions';
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    const sessionFile = path.join(sessionFolder, `${sanitizedPhone}.session`);

    if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
    }

    fs.writeFileSync(sessionFile, sessionString, 'utf8');
    console.log(`Session saved to ${sessionFile}`);
    accounts.set(phoneNumber, client);
}

async function loginWithSessionFile() {
    const sessionFolder = 'sessions';

    if (!fs.existsSync(sessionFolder) || fs.readdirSync(sessionFolder).length === 0) {
        console.log('No session files found.');
        return;
    }

    const sessionFiles = fs.readdirSync(sessionFolder).filter(file => file.endsWith('.session'));

    if (sessionFiles.length === 0) {
        console.log('No session files available.');
        return;
    }

    console.log('Select a session file to login with:');
    sessionFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
    });

    const selectedFileIndex = parseInt(await askQuestion("Enter the session file number (or 0 for all): "), 10);

    if (selectedFileIndex === 0) {
        for (const file of sessionFiles) {
            const sessionData = fs.readFileSync(path.join(sessionFolder, file), 'utf8');

            if (!sessionData || sessionData.trim() === '') {
                console.log(`Session file ${file} is empty or invalid.`);
                continue;
            }

            try {
                const client = new TelegramClient(new StringSession(sessionData), apiId, apiHash, { connectionRetries: 5 });
                await new Promise(resolve => setTimeout(resolve, 5000));
                await client.start();
                const phone = file.replace('.session', '');
                console.log(`Logged in using session file: ${file}`);
                accounts.set(phone, client);
            } catch (error) {
                console.error(`Failed to login using session file ${file}:`, error.message);
            }
        }
    } else {
        const selectedFile = sessionFiles[selectedFileIndex - 1];
        const sessionData = fs.readFileSync(path.join(sessionFolder, selectedFile), 'utf8');

        if (!sessionData || sessionData.trim() === '') {
            console.log(`Session file ${selectedFile} is empty or invalid.`);
            return;
        }

        try {
            const client = new TelegramClient(new StringSession(sessionData), apiId, apiHash, { connectionRetries: 5 });
            await new Promise(resolve => setTimeout(resolve, 5000));
            await client.start();
            const phone = selectedFile.replace('.session', '');
            console.log(`Logged in using session file: ${selectedFile}`);
            accounts.set(phone, client);
        } catch (error) {
            console.error(`Failed to login using session file ${selectedFile}:`, error.message);
        }
    }
}

async function requestWebViewForClient(client, phoneNumber, botPeer, url) {
    try {
        const result = await client.invoke(
            new Api.messages.RequestWebView({
                peer: botPeer,
                bot: botPeer,
                fromBotMenu: false,
                url: url,
                platform: 'android',
            })
        );

        const webAppData = decodeURIComponent(
            result.url.split('#')[1].split('&')[0].split('=')[1]
        );

        const sessionFolder = 'webview_results';
        const sanitizedBot = botPeer.replace('@', '');
        const resultFile = path.join(sessionFolder, `${sanitizedBot}.txt`);

        if (!fs.existsSync(sessionFolder)) {
            fs.mkdirSync(sessionFolder, { recursive: true });
        }

        if (!webviewData[resultFile]) {
            webviewData[resultFile] = {};
        }
        webviewData[resultFile][phoneNumber] = webAppData;

        const output = Object.values(webviewData[resultFile]).join("\n");
        fs.writeFileSync(resultFile, output, 'utf8');
        console.log(`WebView result saved to ${resultFile}`);
    } catch (error) {
        console.error("Error requesting WebView:", error);
    }
}

async function requestWebViewForAllClients() {
    if (accounts.size === 0) {
        console.log('No accounts are logged in.');
        return;
    }

    const botPeer = await askQuestion("Please enter the bot peer (e.g., @YourBot): ");
    const url = await askQuestion("Please enter the WebView URL: ");

    for (const [phoneNumber, client] of accounts.entries()) {
        console.log(`Processing account: ${phoneNumber}`);
        await requestWebViewForClient(client, phoneNumber, botPeer, url);
    }
}

async function logoutClient(client) {
    try {
        await client.logOut();
        console.log('Logged out successfully.');
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

async function main() {
    console.log('Welcome to the Telegram Bot Utility!');
    console.log(intro);

    while (true) {
        console.log('1. Login with phone number');
        console.log('2. Login with session file');
        console.log('3. Request WebView for all accounts');
        console.log('4. Logout and exit');

        const choice = await askQuestion("Please select an option (1/2/3/4): ");

        if (choice === '1') {
            await loginWithPhoneNumber();
        } else if (choice === '2') {
            await loginWithSessionFile();
        } else if (choice === '3') {
            await requestWebViewForAllClients();
        } else if (choice === '4') {
            console.log('Logging out and exiting...');
            for (const [, client] of accounts.entries()) {
                await logoutClient(client);
            }
            rl.close();
            break;
        } else {
            console.log('Invalid option. Please try again.');
        }
    }
}

main();
