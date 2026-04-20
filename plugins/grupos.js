/**
 * GRUPOS - ITSUKI NAKANO
 * #kick #ban #tag #promover #degradar
 * Z0RT SYSTEMS 🌸
 */

const sendGrp = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `👥 ${global.botName||'Itsuki Nakano'}`, 'Gestión de Grupos')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
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

let handler = async (m, { conn, command, text, isOwner, isAdmin, isBotAdmin }) => {
    const cmd    = command.toLowerCase()
    const botJid = normalizeJid(conn.user.id)

    // ── KICK ──────────────────────────────────────────────────────────────────
    if (cmd === 'kick' || cmd === 'expulsar') {
        if (!isBotAdmin) return sendGrp(conn, m, `🤖 Necesito ser admin para expulsar. Dame admin primero~`)
        const target = getTarget(m)
        if (!target) return sendGrp(conn, m, `🦵 Menciona o responde a alguien para expulsarlo.`)
        if (target === botJid) return sendGrp(conn, m, `😤 ¿Expulsarme a mí? No lo creo~`)
        if (isOwnerJid(target) && !isOwner) return sendGrp(conn, m, `👑 No puedes expulsar a un owner.`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            return conn.sendMessage(m.chat, {
                text: `🦵 @${target.split('@')[0]} fue expulsado del grupo.\n_Hasta luego~ 🌸_`,
                mentions: [target]
            }, { quoted: m })
        } catch { return sendGrp(conn, m, `❌ No pude expulsar al usuario.`) }
    }

    // ── BAN ───────────────────────────────────────────────────────────────────
    if (cmd === 'ban') {
        if (!isBotAdmin) return sendGrp(conn, m, `🤖 Necesito ser admin para banear.`)
        const target = getTarget(m)
        if (!target) return sendGrp(conn, m, `🚫 Menciona a alguien para banearlo.`)
        if (target === botJid) return sendGrp(conn, m, `😤 ¿Banearme? NO.`)
        if (isOwnerJid(target) && !isOwner) return sendGrp(conn, m, `👑 No puedes banear a un owner.`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            return conn.sendMessage(m.chat, {
                text: `🚫 @${target.split('@')[0]} fue baneado del grupo.\n_Portarse bien es la clave~ 🌸_`,
                mentions: [target]
            }, { quoted: m })
        } catch { return sendGrp(conn, m, `❌ No pude banear al usuario.`) }
    }

    // ── PROMOVER ──────────────────────────────────────────────────────────────
    if (cmd === 'promover' || cmd === 'promote') {
        if (!isBotAdmin) return sendGrp(conn, m, `🤖 Necesito ser admin para promover.`)
        const target = getTarget(m)
        if (!target) return sendGrp(conn, m, `👑 Menciona a alguien para promoverlo a admin.`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'promote')
            return conn.sendMessage(m.chat, {
                text: `👑 @${target.split('@')[0]} ahora es *administrador* del grupo.\n_¡Úsalo con sabiduría!_ 🌸`,
                mentions: [target]
            }, { quoted: m })
        } catch { return sendGrp(conn, m, `❌ No pude promover al usuario.`) }
    }

    // ── DEGRADAR ──────────────────────────────────────────────────────────────
    if (cmd === 'degradar' || cmd === 'demote') {
        if (!isBotAdmin) return sendGrp(conn, m, `🤖 Necesito ser admin para degradar.`)
        const target = getTarget(m)
        if (!target) return sendGrp(conn, m, `👤 Menciona a alguien para quitarle el admin.`)
        if (isOwnerJid(target) && !isOwner) return sendGrp(conn, m, `👑 No puedes degradar a un owner.`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
            return conn.sendMessage(m.chat, {
                text: `👤 @${target.split('@')[0]} ya no es admin del grupo.\n_Que sea una lección~ 🌸_`,
                mentions: [target]
            }, { quoted: m })
        } catch { return sendGrp(conn, m, `❌ No pude degradar al usuario.`) }
    }

    // ── TAG ───────────────────────────────────────────────────────────────────
    if (cmd === 'tag' || cmd === 'everyone' || cmd === 'todos') {
        await m.react('⏳')
        try {
            const meta    = await conn.groupMetadata(m.chat)
            const members = meta.participants.map(p => p.id)
            const msg     = (text || '').trim() || '¡Atención a todos! 🌸'
            const CHUNK   = 50
            const thumb   = await global.getBannerThumb()
            const ctx     = global.getNewsletterCtx(thumb, `📢 ${global.botName||'Itsuki Nakano'}`, meta.subject)

            for (let i = 0; i < members.length; i += CHUNK) {
                const chunk      = members.slice(i, i + CHUNK)
                const menciones  = chunk.map(jid => `@${jid.split('@')[0]}`).join(' ')
                const esPrimero  = i === 0
                const caption    = esPrimero
                    ? `╔════ ❀ 𝐓𝐀𝐆 ❀ ════╗\n\n📢 *${msg}*\n\n👥 *Grupo:* ${meta.subject}\n🌸 *Miembros:* ${members.length}\n\n${menciones}\n\n╚════ ❀ 🌷 ❀ ════╝`
                    : menciones
                await conn.sendMessage(m.chat, {
                    text: caption, mentions: chunk,
                    contextInfo: esPrimero ? ctx : undefined
                }, { quoted: m })
                if (i + CHUNK < members.length) await new Promise(r => setTimeout(r, 1000))
            }
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendGrp(conn, m, `❌ Error: ${e.message}`)
        }
    }
}

handler.command = ['kick','expulsar','ban','promover','promote','degradar','demote','tag','everyone','todos']
handler.group   = true
handler.admin   = true
export default handler
