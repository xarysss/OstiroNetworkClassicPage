import 'dotenv/config';
import { Bot, GrammyError, HttpError } from 'grammy';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatUser, loadStore, routeKey, saveStore } from './store.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = Number(process.env.ADMIN_CHAT_ID);
const ADMIN_USER_IDS = new Set(
  (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number)
);
const BRAND_NAME = process.env.BRAND_NAME || 'Ostiro Concierge';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://ostiro-network.fr/';
const DATA_FILE = resolve(process.env.DATA_FILE || 'telegram-support-bot/data/support-store.json');
const WELCOME_TEXT = `Bonjour, bienvenue chez ${BRAND_NAME}.\n\nEnvoyez ici votre demande, votre brief ou vos questions. L'equipe vous repond en prive, directement dans cette conversation.`;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN is missing in .env');
if (!ADMIN_CHAT_ID || Number.isNaN(ADMIN_CHAT_ID)) throw new Error('ADMIN_CHAT_ID is missing or invalid in .env');

const bot = new Bot(BOT_TOKEN);
let store = await loadStore(DATA_FILE);

function isAdminChat(ctx) {
  return ctx.chat?.id === ADMIN_CHAT_ID;
}

function isAllowedAdmin(ctx) {
  if (!isAdminChat(ctx)) return false;
  if (!ADMIN_USER_IDS.size) return true;
  return ADMIN_USER_IDS.has(ctx.from?.id);
}

async function persist() {
  await saveStore(DATA_FILE, store);
}

async function configureBotProfile() {
  await bot.api.setMyCommands([
    { command: 'start', description: 'Demarrer une conversation privee' },
    { command: 'help', description: 'Comprendre le fonctionnement' },
    { command: 'id', description: "Afficher l'identifiant du chat" }
  ]);

  await bot.api.raw.setMyName({ name: BRAND_NAME }).catch(() => undefined);
  await bot.api.raw.setMyShortDescription({
    short_description: 'Contact prive pour projets web, branding et presence digitale.'
  }).catch(() => undefined);
  await bot.api.raw.setMyDescription({
    description: `${BRAND_NAME} centralise les demandes venant du site Ostiro Network. Ecrivez ici : votre message reste prive et une personne de l'equipe vous repond directement.`
  }).catch(() => undefined);
}

function rememberUser(user, chatId) {
  store.users[String(chatId)] = {
    id: chatId,
    name: formatUser(user),
    username: user?.username || null,
    first_name: user?.first_name || null,
    last_name: user?.last_name || null,
    last_seen_at: new Date().toISOString()
  };
}

function cleanTopicName(name) {
  return name.replace(/\s+/g, ' ').replace(/[^\p{L}\p{N}\s@._-]/gu, '').trim().slice(0, 120) || 'Client Telegram';
}

async function getConversation(ctx) {
  const userChatId = String(ctx.chat.id);
  const existing = store.conversations[userChatId];
  if (existing?.topicId) return existing;

  const userLabel = formatUser(ctx.from);
  const conversation = existing || {
    userChatId: ctx.chat.id,
    userName: userLabel,
    topicId: null,
    topicName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  conversation.userName = userLabel;
  conversation.updatedAt = new Date().toISOString();

  try {
    const topic = await bot.api.raw.createForumTopic({
      chat_id: ADMIN_CHAT_ID,
      name: cleanTopicName(userLabel)
    });
    conversation.topicId = topic.message_thread_id;
    conversation.topicName = topic.name;
  } catch (error) {
    const description = error?.description || error?.message || '';
    if (!description.includes('not a forum')) {
      console.warn(`Could not create topic for ${userLabel}: ${description}`);
    }
  }

  store.conversations[userChatId] = conversation;
  await persist();
  return conversation;
}

function topicOptions(conversation) {
  return conversation?.topicId ? { message_thread_id: conversation.topicId } : {};
}

function findConversationByTopic(threadId) {
  if (!threadId) return null;
  return Object.values(store.conversations).find((conversation) => conversation.topicId === threadId) || null;
}

async function sendAdminHeader(ctx, conversation) {
  const userLabel = formatUser(ctx.from);
  const lines = [
    `Nouveau message prive - ${BRAND_NAME}`,
    '',
    `Client : ${userLabel}`,
    `ID : ${ctx.chat.id}`,
    '',
    conversation.topicId
      ? 'Ce sujet est dedie a ce client. Ecris ici pour lui repondre.'
      : 'Reponds au message juste en dessous pour parler au client via le bot.'
  ];

  const sent = await bot.api.sendMessage(ADMIN_CHAT_ID, lines.join('\n'), {
    disable_web_page_preview: true,
    ...topicOptions(conversation)
  });

  store.routes[routeKey(ADMIN_CHAT_ID, sent.message_id)] = {
    userChatId: ctx.chat.id,
    userName: userLabel,
    topicId: conversation.topicId,
    sourceMessageId: ctx.message.message_id,
    createdAt: new Date().toISOString()
  };
}

async function routeCustomerMessage(ctx) {
  rememberUser(ctx.from, ctx.chat.id);
  const conversation = await getConversation(ctx);
  conversation.updatedAt = new Date().toISOString();

  if (!conversation.headerSentAt) {
    await sendAdminHeader(ctx, conversation);
    conversation.headerSentAt = new Date().toISOString();
  }

  const copied = await bot.api.copyMessage(ADMIN_CHAT_ID, ctx.chat.id, ctx.message.message_id, topicOptions(conversation));

  store.routes[routeKey(ADMIN_CHAT_ID, copied.message_id)] = {
    userChatId: ctx.chat.id,
    userName: formatUser(ctx.from),
    topicId: conversation.topicId,
    sourceMessageId: ctx.message.message_id,
    createdAt: new Date().toISOString()
  };

  store.messages.push({
    direction: 'customer_to_admin',
    userChatId: ctx.chat.id,
    topicId: conversation.topicId,
    adminMessageId: copied.message_id,
    sourceMessageId: ctx.message.message_id,
    at: new Date().toISOString()
  });
  await persist();

  await ctx.reply('Message bien recu. On vous repond ici en prive.');
}

async function routeAdminReply(ctx) {
  if (!isAllowedAdmin(ctx)) return;
  const replyTo = ctx.message?.reply_to_message?.message_id;
  const topicConversation = findConversationByTopic(ctx.message?.message_thread_id);
  if (!replyTo && !topicConversation) return;

  const route = replyTo ? store.routes[routeKey(ADMIN_CHAT_ID, replyTo)] : null;
  const target = route || topicConversation;
  if (!target) return;

  const text = ctx.message.text || ctx.message.caption || '';
  if (text.trim().toLowerCase() === '/close') {
    await bot.api.sendMessage(target.userChatId, `Merci pour votre message. ${BRAND_NAME} reste disponible ici si besoin.`);
    await ctx.reply('Conversation marquee comme terminee.');
    return;
  }

  await ctx.copyMessage(target.userChatId);
  await ctx.reply(`Reponse envoyee a ${target.userName}.`);

  store.messages.push({
    direction: 'admin_to_customer',
    userChatId: target.userChatId,
    topicId: target.topicId || null,
    adminReplyMessageId: ctx.message.message_id,
    repliedToAdminMessageId: replyTo || null,
    at: new Date().toISOString()
  });
  await persist();
}

bot.command('start', async (ctx) => {
  if (ctx.chat.type !== 'private') {
    await ctx.reply(`${BRAND_NAME} est pret. Les clients doivent ecrire au bot en prive.`);
    return;
  }

  rememberUser(ctx.from, ctx.chat.id);
  await persist();
  await ctx.reply(WELCOME_TEXT, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Voir le site', url: WEBSITE_URL }]
      ]
    }
  });
});

bot.command('help', async (ctx) => {
  await ctx.reply([
    'Fonctionnement :',
    '- Le client ecrit ici en prive.',
    "- L'equipe recoit le message dans le salon admin.",
    '- Une reponse au message admin repart automatiquement au client.'
  ].join('\n'));
});

bot.command('id', async (ctx) => {
  await ctx.reply(`Chat ID : ${ctx.chat.id}`);
});

bot.on('message', async (ctx) => {
  if (isAdminChat(ctx)) {
    await routeAdminReply(ctx);
    return;
  }

  if (ctx.chat.type !== 'private') return;
  if (ctx.message.text?.startsWith('/')) return;

  await routeCustomerMessage(ctx);
});

bot.catch((error) => {
  const ctx = error.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const err = error.error;
  if (err instanceof GrammyError) {
    console.error('Telegram API error:', err.description);
  } else if (err instanceof HttpError) {
    console.error('HTTP error:', err);
  } else {
    console.error(err);
  }
});

await configureBotProfile();

const logoPath = resolve(__dirname, '../assets/logo.svg');
if (existsSync(logoPath)) {
  console.log(`Bot profile image source available: ${logoPath}`);
  console.log('Telegram profile photos must be set once through @BotFather with /setuserpic.');
}

console.log(`${BRAND_NAME} is running. Admin chat: ${ADMIN_CHAT_ID}`);
await bot.start();
