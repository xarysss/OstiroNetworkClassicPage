import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const EMPTY_STORE = {
  users: {},
  conversations: {},
  routes: {},
  messages: []
};

export async function loadStore(file) {
  try {
    const raw = await readFile(file, 'utf8');
    return { ...EMPTY_STORE, ...JSON.parse(raw) };
  } catch (error) {
    if (error.code === 'ENOENT') return structuredClone(EMPTY_STORE);
    throw error;
  }
}

export async function saveStore(file, store) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

export function routeKey(chatId, messageId) {
  return `${chatId}:${messageId}`;
}

export function formatUser(user = {}) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const handle = user.username ? `@${user.username}` : null;
  return [name || 'Utilisateur Telegram', handle].filter(Boolean).join(' ');
}
