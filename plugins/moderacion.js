/**
 * MODERACIÓN - ITSUKI NAKANO
 * #warn #resetwarn #warns #mute #unmute #tempban #closegroup #opengroup #antilink #antispam
 * Z0RT SYSTEMS 🌸
 */

import { database } from '../lib/database.js'

const MAX_WARNS    = 3
const SPAM_MSGS    = 7
const SPAM_VENTANA = 8000

const sendMod = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `🛡️ ${global.botName||'Itsuki Nakano'}`, 'Sistema de Moderación')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const parseTiempo = (str) => {
    if (!str) return null
    const match = str.match(/^(\d+)(s|m|h|d)$/)
    if (!match) return null
    const ms = { s:1000, m:60000, h:3600000, d:86400000 }
    return parseInt(match[1]) * ms[match[2]]
}

const formatTiempo = (ms) => {
    if (ms >= 86400000) return `${Math.floor(ms/86400000)}d`
    if (ms >= 3600000)  return `${Math.floor(ms/3600000)}h`
    if (ms >= 60000)    return `${Math.floor(ms/60000)}m`
    return `${Math.floor(ms/1000)}s`
}

const normalizeJid = (jid) => {
    if (!jid) return ''
    return jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
}

const getTarget = (m) => {
    if (m.mentionedJid?.[0]) return normalizeJid(m.mentionedJid[0])
    if (m.quoted?.sender)    return normalizeJid(m.quoted.sender)
    return null
}

const isOwnerJid = (jid) => {
    const num = (jid+'').replace(/[^0-9]/g,'')
    return (Array.isArray(global.owner) ? global.owner : []).some(o => {
        const n = Array.isArray(o) ? (o[0]+'') : (o+'')
        return n.replace(/[^0-9]/g,'') === num
    })
}

const ensureGrupo = (db, chatId) => {
    if (!db.groups)          db.groups = {}
    if (!db.groups[chatId])  db.groups[chatId] = {}
    const g = db.groups[chatId]
    if (!g.warns)       g.warns       = {}
    if (!g.warnHistory) g.warnHistory = {}
    if (!g.muted)       g.muted       = []
    return g
}

const muteTimers    = new Map()
const tempbanTimers = new Map()
const spamTracker   = new Map()

const aplicarMute = async (conn, chatId, target, tiempoMs, db) => {
    const grupo = ensureGrupo(db, chatId)
    if (!grupo.muted.includes(target)) grupo.muted.push(target)
    const key = `${chatId}:${target}`
    if (muteTimers.has(key)) { clearTimeout(muteTimers.get(key)); muteTimers.delete(key) }
    if (tiempoMs) {
        const timer = setTimeout(async () => {
            const g = db?.groups?.[chatId]
            if (g?.muted) g.muted = g.muted.filter(j => j !== target)
            muteTimers.delete(key)
            try {
                await conn.sendMessage(chatId, {
                    text: `🔊 @${target.split('@')[0]} ya puede hablar de nuevo. _Mute terminó_ 🌸`,
                    mentions: [target]
                })
            } catch {}
        }, tiempoMs)
        muteTimers.set(key, timer)
    }
}

const aplicarWarn = async (conn, chatId, sender, razon, db) => {
    const grupo = ensureGrupo(db, chatId)
    if (!grupo.warns[sender])       grupo.warns[sender] = 0
    if (!grupo.warnHistory[sender]) grupo.warnHistory[sender] = []
    grupo.warns[sender]++
    grupo.warnHistory[sender].push({
        razon, fecha: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }), por: 'Sistema'
    })
    const warns = grupo.warns[sender]
    if (warns >= MAX_WARNS) {
        grupo.warns[sender] = 0
        try {
            await conn.groupParticipantsUpdate(chatId, [sender], 'remove')
            await conn.sendMessage(chatId, {
                text: `🚫 @${sender.split('@')[0]} fue expulsado por acumular *${MAX_WARNS} advertencias*.\n📝 _${razon}_ 🌸`,
                mentions: [sender]
            })
        } catch {}
        return true
    }
    await conn.sendMessage(chatId, {
        text: `⚠️ *ADVERTENCIA ${warns}/${MAX_WARNS}*\n\n@${sender.split('@')[0]} — ${razon}\n\n${warns === MAX_WARNS-1 ? '⚡ *¡Una más y serás expulsado!*' : '_Más advertencias y habrá consecuencias_ 🌸'}`,
        mentions: [sender]
    })
    return false
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, command, text, args, isOwner, isAdmin, isBotAdmin, db }) => {
    const cmd   = command.toLowerCase()
    const grupo = ensureGrupo(db, m.chat)
    const botJid = normalizeJid(conn.user.id)

    // ── WARN ──────────────────────────────────────────────────────────────────
    if (cmd === 'warn') {
        const target = getTarget(m)
        if (!target) return sendMod(conn, m, `⚠️ Menciona o responde a alguien.\n_Uso: *#warn @usuario razón*_`)
        if (target === botJid) return sendMod(conn, m, `😤 ¿Advertirme a mí? NO.`)
        if (isOwnerJid(target) && !isOwner) return sendMod(conn, m, `👑 No puedes advertir a un owner.`)
        const razon = text?.replace(/@\d+/g, '').trim() || 'Sin razón especificada'
        await aplicarWarn(conn, m.chat, target, razon, db)
        return
    }

    // ── RESETWARN ─────────────────────────────────────────────────────────────
    if (cmd === 'resetwarn' || cmd === 'clearwarn') {
        const target = getTarget(m)
        if (!target) return sendMod(conn, m, `Menciona a alguien para resetear sus warns.`)
        grupo.warns[target] = 0; grupo.warnHistory[target] = []
        return conn.sendMessage(m.chat, { text: `✅ Advertencias de @${target.split('@')[0]} borradas. 🌸`, mentions: [target] }, { quoted: m })
    }

    // ── WARNS ─────────────────────────────────────────────────────────────────
    if (cmd === 'warns') {
        const target  = getTarget(m) || normalizeJid(m.sender)
        const warns   = grupo.warns?.[target] || 0
        const history = grupo.warnHistory?.[target] || []
        let histTxt   = ''
        if (history.length) histTxt = '\n\n📋 *Historial:*\n' + history.slice(-3).map((h,i) => `${i+1}. _${h.razon}_ — ${h.fecha}`).join('\n')
        return conn.sendMessage(m.chat, {
            text: `📋 *ADVERTENCIAS*\n\n@${target.split('@')[0]} tiene *${warns}/${MAX_WARNS}* advertencias.\n${warns===0?'_Historial limpio~ 🌸_':warns>=MAX_WARNS-1?'⚡ _¡Está al límite!_':'_Cuidado~ 🌸_'}${histTxt}`,
            mentions: [target]
        }, { quoted: m })
    }

    // ── MUTE ──────────────────────────────────────────────────────────────────
    if (cmd === 'mute') {
        const target = getTarget(m)
        if (!target) return sendMod(conn, m, `🔇 Menciona a alguien.\n_Uso: #mute @usuario 10m_\n_Tiempos: s m h d_`)
        if (target === botJid) return sendMod(conn, m, `😤 ¿Mutearme? Inténtalo~ 🙄`)
        if (isOwnerJid(target) && !isOwner) return sendMod(conn, m, `👑 No puedes mutear a un owner.`)
        const tiempoStr = args.find(a => /^\d+(s|m|h|d)$/.test(a)) || null
        const tiempoMs  = tiempoStr ? parseTiempo(tiempoStr) : null
        await aplicarMute(conn, m.chat, target, tiempoMs, db)
        return conn.sendMessage(m.chat, {
            text: `🔇 @${target.split('@')[0]} muteado${tiempoMs?` por *${formatTiempo(tiempoMs)}*`:' indefinidamente'}.\n_Sus mensajes serán eliminados_ 🌸`,
            mentions: [target]
        }, { quoted: m })
    }

    // ── UNMUTE ────────────────────────────────────────────────────────────────
    if (cmd === 'unmute') {
        const target = getTarget(m)
        if (!target) return sendMod(conn, m, `Menciona a alguien para desmutearlo.`)
        grupo.muted = grupo.muted.filter(j => j !== target)
        const key = `${m.chat}:${target}`
        if (muteTimers.has(key)) { clearTimeout(muteTimers.get(key)); muteTimers.delete(key) }
        return conn.sendMessage(m.chat, { text: `🔊 @${target.split('@')[0]} desmuteado~ 🌸`, mentions: [target] }, { quoted: m })
    }

    // ── TEMPBAN ───────────────────────────────────────────────────────────────
    if (cmd === 'tempban') {
        if (!isBotAdmin) return sendMod(conn, m, `🤖 Necesito ser admin para expulsar. Dame admin primero~`)
        const target = getTarget(m)
        if (!target) return sendMod(conn, m, `⏱️ Menciona a alguien.\n_Uso: #tempban @usuario 10m_`)
        if (target === botJid) return sendMod(conn, m, `😤 ¿Banearme? NO.`)
        if (isOwnerJid(target) && !isOwner) return sendMod(conn, m, `👑 No puedes banear a un owner.`)
        const tiempoStr = args.find(a => /^\d+(s|m|h|d)$/.test(a)) || null
        const tiempoMs  = tiempoStr ? parseTiempo(tiempoStr) : 3600000
        try { await conn.groupParticipantsUpdate(m.chat, [target], 'remove') }
        catch { return sendMod(conn, m, `❌ No pude expulsar al usuario.`) }
        await conn.sendMessage(m.chat, {
            text: `⏱️ @${target.split('@')[0]} expulsado por *${formatTiempo(tiempoMs)}*. Recibirá el link al terminar~ 🌸`,
            mentions: [target]
        }, { quoted: m })
        const banKey = `${m.chat}:${target}`
        if (tempbanTimers.has(banKey)) { clearTimeout(tempbanTimers.get(banKey)); tempbanTimers.delete(banKey) }
        const timer = setTimeout(async () => {
            tempbanTimers.delete(banKey)
            try {
                const invite = await conn.groupInviteCode(m.chat)
                await conn.sendMessage(target, { text: `🔓 Tu tempban terminó. Puedes volver:\nhttps://chat.whatsapp.com/${invite}\n\n_Pórtate bien~ 🌸_` })
            } catch {}
        }, tiempoMs)
        tempbanTimers.set(banKey, timer)
        return
    }

    // ── CLOSEGROUP / OPENGROUP ────────────────────────────────────────────────
    if (cmd === 'closegroup' || cmd === 'cerrargrupo') {
        if (!isBotAdmin) return sendMod(conn, m, `🤖 Necesito ser admin para cerrar el grupo.`)
        try { await conn.groupSettingUpdate(m.chat, 'announcement'); return sendMod(conn, m, `🔒 *GRUPO CERRADO*\nSolo admins pueden escribir~ 🌸`) }
        catch { return sendMod(conn, m, `❌ No pude cerrar el grupo.`) }
    }
    if (cmd === 'opengroup' || cmd === 'abrirgrupo') {
        if (!isBotAdmin) return sendMod(conn, m, `🤖 Necesito ser admin para abrir el grupo.`)
        try { await conn.groupSettingUpdate(m.chat, 'not_announcement'); return sendMod(conn, m, `🔓 *GRUPO ABIERTO*\nTodos pueden escribir~ 🌸`) }
        catch { return sendMod(conn, m, `❌ No pude abrir el grupo.`) }
    }

    // ── ANTILINK ──────────────────────────────────────────────────────────────
    if (cmd === 'antilink') {
        grupo.antilink = !grupo.antilink
        return sendMod(conn, m, `🔗 *ANTILINK ${grupo.antilink?'ACTIVADO ✅':'DESACTIVADO ❌'}*\n\n${grupo.antilink?`Eliminaré links y advertiré al usuario. A los ${MAX_WARNS} warns → kick~ 🌸`:'Ya se pueden enviar links~ 🌸'}`)
    }

    // ── ANTISPAM ──────────────────────────────────────────────────────────────
    if (cmd === 'antispam') {
        grupo.antispam = !grupo.antispam
        return sendMod(conn, m, `🚫 *ANTISPAM ${grupo.antispam?'ACTIVADO ✅':'DESACTIVADO ❌'}*\n\n${grupo.antispam?`${SPAM_MSGS} mensajes en ${SPAM_VENTANA/1000}s → mute + warn. A los ${MAX_WARNS} warns → kick~ 🌸`:'El antispam está desactivado~ 🌸'}`)
    }
}

handler.command = ['warn','resetwarn','clearwarn','warns','mute','unmute','tempban','closegroup','cerrargrupo','opengroup','abrirgrupo','antilink','antispam']
handler.group   = true
handler.admin   = true

// ── BEFORE ────────────────────────────────────────────────────────────────────
handler.before = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup || !m.body) return false
    const db    = database.data
    const grupo = db?.groups?.[m.chat]
    if (!grupo) return false
    const sender = normalizeJid(m.sender)
    if (isAdmin || isOwner || isOwnerJid(sender)) return false

    // Mute
    if (grupo.muted?.includes(sender)) {
        try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
        return true
    }

    // Antilink
    if (grupo.antilink) {
        const linkRegex = /https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/gi
        if (linkRegex.test(m.body)) {
            try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
            await aplicarWarn(conn, m.chat, sender, 'Envío de link (antilink)', db)
            return true
        }
    }

    // Antispam
    if (grupo.antispam) {
        const key = `${m.chat}:${sender}`
        const now = Date.now()
        if (!spamTracker.has(key)) {
            spamTracker.set(key, { count:1, firstMsg:now })
        } else {
            const t = spamTracker.get(key)
            if (now - t.firstMsg >= SPAM_VENTANA) {
                spamTracker.set(key, { count:1, firstMsg:now })
            } else {
                t.count++
                if (t.count >= SPAM_MSGS) {
                    spamTracker.delete(key)
                    try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
                    await aplicarMute(conn, m.chat, sender, 5*60*1000, db)
                    const expulsado = await aplicarWarn(conn, m.chat, sender, 'Spam detectado', db)
                    if (!expulsado) {
                        await conn.sendMessage(m.chat, {
                            text: `🚫 @${sender.split('@')[0]} detectado haciendo spam. Muteado 5 minutos~ 🌸`,
                            mentions: [sender]
                        })
                    }
                    return true
                }
            }
        }
    }
    return false
}

export default handler
