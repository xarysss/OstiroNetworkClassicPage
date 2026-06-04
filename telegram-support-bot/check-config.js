import 'dotenv/config';
import { Bot } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is missing in .env');
  process.exit(1);
}

const bot = new Bot(token);
const me = await bot.api.getMe();

console.log(`Bot connected: @${me.username} (${me.first_name})`);
console.log(`Admin chat ID: ${process.env.ADMIN_CHAT_ID || 'missing'}`);
