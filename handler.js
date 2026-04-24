import './settings.js';
import chalk from 'chalk';
import printLog from './lib/print.js';
import { smsg } from './lib/simple.js';
import { database } from './lib/database.js';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const toNum      = v => (v + '').replace(/[^0-9]/g, '');
const localPart  = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0];
const normalizeCore = v => toNum(localPart(v));

const normalizeJid = v => {
    if (!v) return '';
    if (typeof v === 'number') v = String(v);
    v = (v + '').trim();
    if (v.startsWith('@')) v = v.slice(1);
    if (v.endsWith('@g.us')) return v;
    if (v.includes('@s.whatsapp.net')) {
        const n = toNum(v.split('@')[0]);
        return n ? n + '@s.whatsapp.net' : v;
    }
    const n = toNum(v);
    return n ? n + '@s.whatsapp.net' : v;
};

function pickOwners() {
    const arr  = Array.isArray(global.owner) ? global.owner : [];
    const flat = [];
    for (const v of arr) {
        if (Array.isArray(v)) flat.push({ num: normalizeCore(v[0]), root: !!v[2] });
        else flat.push({ num: normalizeCore(v), root: false });
    }
    return flat;
}

function isOwnerJid(jid) {
    const num = normalizeCore(jid);
    return pickOwners().some(o => o.num === num);
}

function isRootOwnerJid(jid) {
    const num = normalizeCore(jid);
    return pickOwners().some(o => o.num === num && o.root);
}

function isPremiumJid(jid) {
    const num   = normalizeCore(jid);
    const prems = Array.isArray(global.prems) ? global.prems.map(normalizeCore) : [];
    if (prems.includes(num)) return true;
    const u = database.data?.users?.[normalizeJid(jid)];
    return !!u?.premium;
}

const PREFIXES = ['#', '.', '/', '$'];

function getPrefix(body) {
    for (const p of PREFIXES) {
        if (body.startsWith(p)) return p;
    }
    return null;
}

const similarity = (a, b) => {
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100);
};

const eventsLoadedFor = new WeakSet();

export const loadEvents = async (conn) => {
    if (!conn?.ev?.on) return;
    if (eventsLoadedFor.has(conn)) return;
    eventsLoadedFor.add(conn);

    const eventsPath = resolve('./events');
    let files = [];

    try {
        files = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    } catch {
        console.log(chalk.yellow('✦ [EVENTS] Carpeta ./events no encontrada, omitiendo...'));
        return;
    }

    for (const file of files) {
        try {
            const url = pathToFileURL(join(eventsPath, file)).href;
            const mod = await import(url);
            if (!mod.event || !mod.run) continue;
            conn.ev.on(mod.event, (data) => {
                const id = data?.id || data?.key?.remoteJid || null;
                if (mod.enabled && id && !mod.enabled(id)) return;
                mod.run(conn, data);
            });
            console.log(chalk.greenBright(`✦ [EVENTS] ${file} → ${mod.event}`));
        } catch (e) {
            console.log(chalk.red(`[EVENTS ERROR] ${file}:`), e.message);
        }
    }
};

export const handler = async (m, conn, plugins) => {
    try {
        if (!m) return;

        await loadEvents(conn);
        m = await smsg(conn, m);

        // ── Bot OFF global ────────────────────────────────────────────────────
        if (global.botOff && !m.fromMe) {
            const senderCheck = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
            if (!isOwnerJid(senderCheck)) return
        }

        // ── Primary: sub-bots ignorar grupos con primaryOnly ──────────────────
        if (m.isGroup && conn._subbotId) {
            const groupData = database.data?.groups?.[m.chat]
            if (groupData?.primaryOnly) {
                const body = (m.body || '').trim().toLowerCase()
                const isPrimaryCmd = ['#setprimary','#removeprimary','.setprimary','.removeprimary']
                    .some(c => body.startsWith(c))
                if (!isPrimaryCmd) return
            }
        }

        // ── Mute ──────────────────────────────────────────────────────────────
        if (m.isGroup) {
            const muted = database.data?.groups?.[m.chat]?.muted || []
            if (muted.includes(m.sender)) {
                try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
                return
            }
        }

        if (!m.body) return;

        const prefix = getPrefix(m.body);
        if (m.body && !m.fromMe) {
            printLog(!!prefix, m.sender, m.isGroup ? m.chat : null, m.body, m.pushName);
        }

        // ── handler.before ────────────────────────────────────────────────────
        if (m.isGroup) {
            const bodyCheck   = (m.body || '').trim()
            const tienePrefix = ['#', '.', '/', '$'].some(p => bodyCheck.startsWith(p))

            if (!tienePrefix) {
                for (const [, plugin] of plugins) {
                    if (typeof plugin?.before === 'function') {
                        try {
                            const senderB  = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
                            const isOwnerB = isOwnerJid(senderB)
                            let isAdminB   = isOwnerB
                            if (!isAdminB) {
                                try {
                                    const gMeta = await conn.groupMetadata(m.chat)
                                    isAdminB = gMeta.participants.some(p =>
                                        (normalizeCore(p.id || p.jid) === normalizeCore(senderB)) &&
                                        (p.admin || p.isAdmin || p.isSuperAdmin)
                                    )
                                } catch {}
                            }
                            const stop = await plugin.before(m, { conn, isAdmin: isAdminB, isOwner: isOwnerB })
                            if (stop === true) return
                        } catch (e) {
                            console.log(chalk.red('[BEFORE ERROR]'), e.message)
                        }
                    }
                }
            }
        }

        if (!prefix) return;

        const body        = m.body.slice(prefix.length).trim();
        const args        = body.split(/ +/).filter(Boolean);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        // ── Normalización del sender ──────────────────────────────────────────
        let senderJid         = m.sender || '';
        const senderRawFull   = senderJid;
        const senderCanonical = senderRawFull.replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '');

        if (senderCanonical !== senderJid) {
            m.realSender = senderJid;
            senderJid    = senderCanonical;
        }

        if (senderJid.endsWith('@lid') && m.isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat);
                const rawNum    = normalizeCore(senderJid);
                const found     = groupMeta.participants.find(p => normalizeCore(p.id || p.jid) === rawNum);
                if (found && (found.jid || found.id)?.endsWith('@s.whatsapp.net')) {
                    senderJid = (found.jid || found.id).includes(':')
                        ? (found.jid || found.id).split(':')[0] + '@s.whatsapp.net'
                        : (found.jid || found.id);
                    m.sender = senderJid;
                }
            } catch {}
        }

        const isROwner = isRootOwnerJid(senderJid);
        const isOwner  = isROwner || isOwnerJid(senderJid);

        // ── Búsqueda de comando ───────────────────────────────────────────────
        let cmd = null;

        if (prefix === '$') {
            for (const [, plugin] of plugins) {
                if (plugin.customPrefix?.includes?.('$')) {
                    cmd = plugin; args.unshift(commandName); break;
                }
            }
        } else {
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue;
                const cmds = Array.isArray(plugin.command)
                    ? plugin.command
                    : plugin.command instanceof RegExp ? [] : [plugin.command];
                if (cmds.map(c => c.toLowerCase()).includes(commandName)) {
                    cmd = plugin; break;
                }
            }
        }

        // ── Comando no encontrado ─────────────────────────────────────────────
        if (!cmd) {
            const allCommands = [];
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue;
                const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                for (const c of cmds) { if (typeof c === 'string') allCommands.push(c.toLowerCase()); }
            }

            const similares = allCommands
                .map(c => ({ cmd: c, score: similarity(commandName, c) }))
                .filter(o => o.score >= 45)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            const sugerencias = similares.length
                ? similares.map(s => `↬ ✦ \`${prefix + s.cmd}\` ➜ *${s.score}%* de similitud`).join('\n')
                : `◈ _No encontré ningún comando parecido._ (•ิ_•ิ)?`;

            const textoBase = isOwner
                ? `─── ❖ ── ✦ ── ❖ ───\n✦ 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎\n─── ❖ ── ✦ ── ❖ ───\n\n◈ 𝐂𝐫𝐞𝐚𝐝𝐨𝐫, *${prefix + commandName}* no existe. (⊙_⊙)\n◈ Usa *${prefix}menu* para ver todos los comandos. ( ◡‿◡ *)`
                : `─── ❖ ── ✦ ── ❖ ───\n✦ 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎\n─── ❖ ── ✦ ── ❖ ───\n\n◈ *${prefix + commandName}* no existe. (°ロ°) !\n◈ Usa *${prefix}menu* para explorar los comandos disponibles. (ꈍᴗꈍ)`;

            const finalMessage = similares.length
                ? `${textoBase}\n\n✦ 𝐓𝐚𝐥 𝐯𝐞𝐳 𝐪𝐮𝐢𝐬𝐢𝐬𝐭𝐞 𝐝𝐞𝐜𝐢𝐫...\n${sugerencias}\n\n⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`
                : `${textoBase}\n\n${sugerencias}\n\n⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`;

            return conn.sendMessage(m.chat, { text: finalMessage }, { quoted: m });
        }

        const isPremium    = isOwner || isPremiumJid(senderJid);
        const isRegistered = isOwner || !!database.data?.users?.[senderJid]?.registered;

        const isGroup  = m.isGroup;
        let isAdmin    = false;
        let isBotAdmin = false;

        if (isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat);
                isAdmin = groupMeta.participants.some(p =>
                    (p.id === senderJid || p.jid === senderJid) && (p.admin || p.isAdmin || p.isSuperAdmin)
                ) || isOwner;
                const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                isBotAdmin   = groupMeta.participants.some(p =>
                    (p.id === botJid || p.jid === botJid) && (p.admin || p.isAdmin || p.isSuperAdmin)
                );
            } catch (err) {
                console.log(chalk.red('[ERROR GROUP META]'), err.message);
            }
        }

        // ── Inicialización DB ─────────────────────────────────────────────────
        if (!database.data.users)  database.data.users  = {};
        if (!database.data.groups) database.data.groups = {};

        if (!database.data.users[senderJid]) {
            database.data.users[senderJid] = {
                registered: false, premium: false, banned: false,
                warning: 0, exp: 0, level: 1, limit: 20,
                lastclaim: 0, registered_time: 0,
                name: m.pushName || '', age: null
            };
        }

        if (isGroup && !database.data.groups[m.chat]) {
            database.data.groups[m.chat] = { modoadmin: false, muted: [] };
        }

        // ── Resolver who ──────────────────────────────────────────────────────
        let who = null;
        if (m.mentionedJid?.[0]) who = m.mentionedJid[0];
        else if (m.quoted?.sender) who = m.quoted.sender;

        if (who) {
            const rawNum = who.split('@')[0].split(':')[0];
            const isLid  = who.endsWith('@lid') || rawNum.length > 13;
            if (isLid && m.isGroup) {
                try {
                    const groupMeta = await conn.groupMetadata(m.chat);
                    const found     = groupMeta.participants.find(p => normalizeCore(p.id || p.jid) === rawNum);
                    if (found?.jid?.endsWith('@s.whatsapp.net')) {
                        who = found.jid.includes(':') ? found.jid.split(':')[0] + '@s.whatsapp.net' : found.jid;
                    } else if (found?.id?.endsWith('@s.whatsapp.net')) {
                        who = found.id;
                    } else {
                        who = rawNum + '@s.whatsapp.net';
                    }
                } catch { who = rawNum + '@s.whatsapp.net'; }
            } else {
                who = rawNum + '@s.whatsapp.net';
            }
        }

        // ── Validaciones ──────────────────────────────────────────────────────

        if (isGroup && database.data.groups[m.chat]?.modoadmin && !isAdmin && !isOwner) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 𝐀𝐂𝐓𝐈𝐕𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Solo obedezco a los administradores en este momento. (〃￣ω￣〃)\n` +
                `◈ Solicita ayuda a un admin del grupo. (ꈍᴗꈍ)`
            )
        }

        if (database.data.settings?.modoowner && !isOwner) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐌𝐎𝐃𝐎 𝐎𝐖𝐍𝐄𝐑 𝐀𝐂𝐓𝐈𝐕𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Ahora mismo solo atiendo a mis creadores. (〃￣ω￣〃)\n` +
                `◈ Vuelve pronto. ( ◡‿◡ *)`
            )
        }

        if (database.data.users[senderJid]?.banned && !isOwner) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐑𝐄𝐒𝐓𝐑𝐈𝐍𝐆𝐈𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ No puedo atenderte, estás en la lista restringida. (￣ヘ￣)\n` +
                `◈ Contacta al creador si crees que es un error.`
            )
        }

        if (cmd.rowner && !isROwner) {
            return m.reply(
                isOwner
                    ? `◈ 𝐂𝐫𝐞𝐚𝐝𝐨𝐫, procedo de inmediato. ٩(◕‿◕)۶`
                    : `─── ❖ ── ✦ ── ❖ ───\n✦ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎\n─── ❖ ── ✦ ── ❖ ───\n\n◈ Este comando es exclusivo del creador principal. (￣ヘ￣)`
            )
        }

        if (cmd.owner && !isOwner) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐑𝐄𝐒𝐓𝐑𝐈𝐍𝐆𝐈𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Este comando es exclusivo para los creadores. (￣ヘ￣)\n` +
                `◈ No tienes permiso para ejecutarlo.`
            )
        }

        if (cmd.premium && !isPremium) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Necesitas ser 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 para usar este comando. (〃￣ω￣〃)\n` +
                `◈ Contacta al creador para obtener acceso. (ꈍᴗꈍ)`
            )
        }

        if (cmd.register && !isRegistered) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐑𝐄𝐐𝐔𝐄𝐑𝐈𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Primero debes registrarte. (⊙_⊙)\n` +
                `◈ Usa: *${prefix}reg nombre.edad*\n` +
                `◈ Ejemplo: *${prefix}reg Itsuki.20* ( ◡‿◡ *)`
            )
        }

        if (cmd.group && !isGroup) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐒𝐎𝐋𝐎 𝐄𝐍 𝐆𝐑𝐔𝐏𝐎𝐒\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Este comando solo funciona dentro de un grupo. (°ロ°) !\n` +
                `◈ Ejecutalo en un grupo donde este el bot. (ꈍᴗꈍ)`
            )
        }

        if (cmd.admin && !isAdmin) {
            return m.reply(
                isOwner
                    ? `◈ 𝐂𝐫𝐞𝐚𝐝𝐨𝐫, procedo. ٩(◕‿◕)۶`
                    : `─── ❖ ── ✦ ── ❖ ───\n` +
                      `✦ 𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑𝐄𝐒\n` +
                      `─── ❖ ── ✦ ── ❖ ───\n\n` +
                      `◈ Necesitas ser administrador del grupo para usar esto. (￣ヘ￣)\n` +
                      `◈ Solicita el rango a un admin. (ꈍᴗꈍ)`
            )
        }

        if (cmd.botAdmin && !isBotAdmin) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐍𝐄𝐂𝐄𝐒𝐈𝐓𝐎 𝐒𝐄𝐑 𝐀𝐃𝐌𝐈𝐍\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Necesito ser administrador del grupo para ejecutar esto. (つ≧▽≦)つ\n` +
                `◈ Por favor dame el rango de admin. ( ◡‿◡ *)`
            )
        }

        if (cmd.private && isGroup) {
            return m.reply(
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐒𝐎𝐋𝐎 𝐄𝐍 𝐏𝐑𝐈𝐕𝐀𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Este comando es privado. Usalo en nuestro chat personal. (〃￣ω￣〃)\n` +
                `◈ Escribeme directamente. ( ◡‿◡ *)`
            )
        }

        if (cmd.limit && !isPremium && !isOwner) {
            const userLimit = database.data.users[senderJid].limit ?? 0;
            if (userLimit < 1) {
                return m.reply(
                    `─── ❖ ── ✦ ── ❖ ───\n` +
                    `✦ 𝐋𝐈́𝐌𝐈𝐓𝐄 𝐀𝐆𝐎𝐓𝐀𝐃𝐎\n` +
                    `─── ❖ ── ✦ ── ❖ ───\n\n` +
                    `◈ Has agotado tus usos disponibles por hoy. (－‸－)\n` +
                    `◈ Vuelve manana o adquiere 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 para limites ilimitados. (ꈍᴗꈍ)`
                )
            }
            database.data.users[senderJid].limit -= 1;
        }

        // ── Ejecución del plugin ──────────────────────────────────────────────
        try {
            const fn = typeof cmd.run === 'function'
                ? cmd.run.bind(cmd)
                : typeof cmd === 'function' ? cmd : null
            if (!fn) throw new TypeError(`El plugin "${commandName}" no exporta una función válida`)

            await fn(m, {
                conn, args,
                text: args.join(' '),
                command: commandName,
                usedPrefix: prefix,
                isOwner, isROwner, isPremium, isRegistered,
                isAdmin, isBotAdmin, isGroup,
                who, db: database.data, prefix, plugins
            });
        } catch (e) {
            console.log(chalk.red('\n[!] ERROR EN PLUGIN:'), e);

            const name       = e?.name    || 'Error desconocido';
            const message    = e?.message || String(e);
            const stackLines = e?.stack?.split('\n') || [];
            let file = 'desconocido', line = '?';

            for (const l of stackLines) {
                const match = l.match(/\((.*plugins.*[\\/]([^:\\/]+)):(\d+):(\d+)\)/);
                if (match) { file = match[2]; line = match[3]; break; }
            }

            const debug = isOwner
  ? '── ✦ ── ✦ ──\n' +
    '✨ ERROR DETECTADO\n' +
    '── ✦ ── ✦ ──\n\n' +
    '◇ Creador, algo se rompió. (–_–)\n\n' +
    `➤ Comando: *${prefix + commandName}*\n` +
    `➤ Archivo: ${file} (Línea: ${line})\n` +
    `➤ Error: ${name}\n\n` +
    `◇ Detalle:\n${message.slice(0, 280)}\n\n` +
'──────'
  : '';