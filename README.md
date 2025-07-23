# Visual Website Change Detector Bot

This project uses GitHub Actions, Node.js, Playwright, and Pixelmatch to visually monitor any webpage every 5 minutes. If a change is detected, it sends a Telegram alert with the diff image.

## Setup

1. Create a bot using @BotFather on Telegram.
2. Create a secret in GitHub:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Replace the `TARGET_URL` in `monitor.js` with the webpage you want to monitor.
4. Push to GitHub — the bot runs every 5 minutes via GitHub Actions.

All alerts will include the changed pixels and a visual diff as a screenshot.
