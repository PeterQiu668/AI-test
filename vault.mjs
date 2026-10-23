import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

// The encrypted vault lives outside the served project directory. The passphrase is never persisted.
export const vaultPath = process.env.KUNJIE_VAULT_PATH || join(process.env.LOCALAPPDATA || homedir(), 'KunjieAIDiagnosis', 'credentials.enc');
export async function vaultExists() { try { await readFile(vaultPath); return true; } catch { return false; } }
const keyFor = (passphrase, salt) => scryptSync(passphrase, salt, 32);
export async function openVault(passphrase) {
  const packet = JSON.parse(await readFile(vaultPath, 'utf8'));
  const key = keyFor(passphrase, Buffer.from(packet.salt, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(packet.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(packet.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(packet.data, 'base64')), decipher.final()]).toString('utf8'));
}
export async function saveVault(passphrase, settings) {
  const salt = randomBytes(16), iv = randomBytes(12), key = keyFor(passphrase, salt);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(settings), 'utf8'), cipher.final()]);
  await mkdir(dirname(vaultPath), { recursive: true });
  await writeFile(vaultPath, JSON.stringify({ version: 1, salt: salt.toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }), { encoding: 'utf8', mode: 0o600 });
}
export function constantEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
