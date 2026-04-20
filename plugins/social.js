/**
 * SOCIAL - ITSUKI NAKANO
 * #casar #aceptar #divorcio #adoptar #duelo #aceptarduelo #carta #verificar
 * Z0RT SYSTEMS 🌸
 */

const sendSocial = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `💕 ${global.botName||'Itsuki Nakano'}`, 'Social')
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

const ensureUser = (db, jid) => {
    if (!db.users)      db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    return db.users[jid]
}

// Solicitudes pendientes
const solicitudesCasamiento = new Map()
const solicitudesDuelo      = new Map()

let handler = async (m, { conn, command, text, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const u      = ensureUser(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const px     = global.prefix || '#'

    // ── CASAR ─────────────────────────────────────────────────────────────────
    if (cmd === 'casar' || cmd === 'marry') {
        const target = getTarget(m)
        if (!target) return sendSocial(conn, m, `💍 Menciona a alguien para proponerle matrimonio~\n_Uso: ${px}casar @usuario_`)
        if (target === sender) return sendSocial(conn, m, `😂 No puedes casarte contigo mismo~`)
        if (u.pareja) return sendSocial(conn, m, `💔 Ya estás casado/a con @${u.pareja.split('@')[0]}~\n_Usa *${px}divorcio* primero_ 🌸`, [u.pareja])

        ensureUser(db, target)
        const targetUser = db.users[target]
        if (targetUser.pareja) return sendSocial(conn, m,
            `💔 @${target.split('@')[0]} ya está casado/a~`, [target]
        )

        solicitudesCasamiento.set(target, { de: sender, nombre: name, timestamp: Date.now() })
        setTimeout(() => solicitudesCasamiento.delete(target), 60000)

        return conn.sendMessage(m.chat, {
            text: `💍 *¡PROPUESTA DE MATRIMONIO!*\n\n` +
                  `@${sender.split('@')[0]} le propone matrimonio a @${target.split('@')[0]} 💕\n\n` +
                  `_@${target.split('@')[0]}, usa *${px}aceptar* para aceptar~_\n` +
                  `_Tienes 60 segundos para responder_ 🌸`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const thumb=await global.getBannerThumb(); return global.getNewsletterCtx(thumb,`💍 ${global.botName||'Itsuki Nakano'}`,'Social') })())
        }, { quoted: m })
    }

    // ── ACEPTAR ───────────────────────────────────────────────────────────────
    if (cmd === 'aceptar' || cmd === 'accept') {
        // Aceptar casamiento
        const solCas = solicitudesCasamiento.get(sender)
        if (solCas) {
            solicitudesCasamiento.delete(sender)
            ensureUser(db, solCas.de)
            db.users[sender].pareja  = solCas.de
            db.users[solCas.de].pareja = sender
            return conn.sendMessage(m.chat, {
                text: `💒 *¡MATRIMONIO CELEBRADO!*\n\n` +
                      `@${solCas.de.split('@')[0]} 💍 @${sender.split('@')[0]}\n\n` +
                      `_¡Que sean muy felices~ 🌸🎊_`,
                mentions: [solCas.de, sender],
                contextInfo: (await (async()=>{ const thumb=await global.getBannerThumb(); return global.getNewsletterCtx(thumb,`💒 ${global.botName||'Itsuki Nakano'}`,'Social') })())
            }, { quoted: m })
        }
        // Aceptar duelo
        const solDuelo = solicitudesDuelo.get(sender)
        if (solDuelo) {
            solicitudesDuelo.delete(sender)
            // Simular duelo
            const retadorWin = Math.random() < 0.5
            const ganador = retadorWin ? solDuelo.de : sender
            const perdedor = retadorWin ? sender : solDuelo.de
            ensureUser(db, solDuelo.de); ensureUser(db, sender)
            db.users[ganador].wins = (db.users[ganador].wins || 0) + 1
            return conn.sendMessage(m.chat, {
                text: `⚔️ *¡DUELO COMPLETADO!*\n\n` +
                      `@${solDuelo.de.split('@')[0]} VS @${sender.split('@')[0]}\n\n` +
                      `🏆 *Ganador:* @${ganador.split('@')[0]}\n` +
                      `💔 *Perdedor:* @${perdedor.split('@')[0]}\n\n` +
                      `_¡Buen combate~ 🌸_`,
                mentions: [solDuelo.de, sender],
                contextInfo: (await (async()=>{ const thumb=await global.getBannerThumb(); return global.getNewsletterCtx(thumb,`⚔️ ${global.botName||'Itsuki Nakano'}`,'Social') })())
            }, { quoted: m })
        }
        return sendSocial(conn, m, `❌ No tienes ninguna solicitud pendiente~`)
    }

    // ── DIVORCIO ──────────────────────────────────────────────────────────────
    if (cmd === 'divorcio' || cmd === 'divorce') {
        if (!u.pareja) return sendSocial(conn, m, `❌ No estás casado/a con nadie~`)
        const exPareja = u.pareja
        ensureUser(db, exPareja)
        delete db.users[exPareja].pareja
        delete u.pareja
        return sendSocial(conn, m,
            `💔 *DIVORCIO*\n\n@${sender.split('@')[0]} y @${exPareja.split('@')[0]} se divorciaron.\n_Que cada quien encuentre su camino~ 🌸_`,
            [sender, exPareja]
        )
    }

    // ── ADOPTAR ───────────────────────────────────────────────────────────────
    if (cmd === 'adoptar' || cmd === 'adopt') {
        const target = getTarget(m)
        if (!target) return sendSocial(conn, m, `👨‍👩‍👧 Menciona a alguien para adoptarlo~\n_Uso: ${px}adoptar @usuario_`)
        if (target === sender) return sendSocial(conn, m, `😂 No puedes adoptarte a ti mismo~`)
        ensureUser(db, target)
        if (!u.hijos) u.hijos = []
        if (u.hijos.includes(target)) return sendSocial(conn, m,
            `❌ Ya adoptaste a @${target.split('@')[0]}~`, [target]
        )
        u.hijos.push(target)
        db.users[target].padre = sender
        return sendSocial(conn, m,
            `👨‍👩‍👧 *¡ADOPCIÓN COMPLETADA!*\n\n` +
            `@${sender.split('@')[0]} adoptó a @${target.split('@')[0]} 💕\n\n` +
            `_¡Cuídalo bien~ 🌸_`,
            [sender, target]
        )
    }

    // ── DUELO ─────────────────────────────────────────────────────────────────
    if (cmd === 'duelo' || cmd === 'duel') {
        const target = getTarget(m)
        if (!target) return sendSocial(conn, m, `⚔️ Menciona a alguien para retarlo a duelo~\n_Uso: ${px}duelo @usuario_`)
        if (target === sender) return sendSocial(conn, m, `😂 No puedes duelo contigo mismo~`)

        solicitudesDuelo.set(target, { de: sender, nombre: name, timestamp: Date.now() })
        setTimeout(() => solicitudesDuelo.delete(target), 60000)

        return conn.sendMessage(m.chat, {
            text: `⚔️ *¡RETO DE DUELO!*\n\n` +
                  `@${sender.split('@')[0]} reta a @${target.split('@')[0]} a un duelo ⚔️\n\n` +
                  `_@${target.split('@')[0]}, usa *${px}aceptar* para combatir~_\n` +
                  `_Tienes 60 segundos_ 🌸`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const thumb=await global.getBannerThumb(); return global.getNewsletterCtx(thumb,`⚔️ ${global.botName||'Itsuki Nakano'}`,'Social') })())
        }, { quoted: m })
    }

    // ── CARTA ─────────────────────────────────────────────────────────────────
    if (cmd === 'carta') {
        const target  = getTarget(m)
        const mensaje = text?.replace(/@\d+/g, '').trim()
        if (!target || !mensaje) return sendSocial(conn, m,
            `💌 *CARTA DE AMOR*\n\nUso: *${px}carta @usuario mensaje*\n_Ejemplo: ${px}carta @amigo Eres increíble~_ 🌸`
        )
        return conn.sendMessage(m.chat, {
            text: `💌 *CARTA ESPECIAL*\n\n` +
                  `De: @${sender.split('@')[0]}\n` +
                  `Para: @${target.split('@')[0]}\n\n` +
                  `╔════ ❀ ════╗\n` +
                  `${mensaje}\n` +
                  `╚════ ❀ ════╝\n\n` +
                  `_Con cariño~ 🌸_`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const thumb=await global.getBannerThumb(); return global.getNewsletterCtx(thumb,`💌 ${global.botName||'Itsuki Nakano'}`,'Social') })())
        }, { quoted: m })
    }

    // ── VERIFICAR (perfil social) ─────────────────────────────────────────────
    if (cmd === 'verificar' || cmd === 'perfil') {
        const target = getTarget(m) || sender
        ensureUser(db, target)
        const user = db.users[target]
        const esTuyo = target === sender
        return sendSocial(conn, m,
            `👤 *PERFIL SOCIAL*\n\n` +
            `🌸 *@${target.split('@')[0]}*\n\n` +
            `💍 Pareja: ${user.pareja ? `@${user.pareja.split('@')[0]}` : 'Soltero/a'}\n` +
            `👨‍👩‍👧 Hijos: ${user.hijos?.length || 0}\n` +
            `👴 Padre/Madre: ${user.padre ? `@${user.padre.split('@')[0]}` : 'Sin registrar'}\n` +
            `🏆 Victorias: ${user.wins || 0}\n` +
            `💰 Coins: ${(user.money || 0).toLocaleString()}\n` +
            `✨ Exp: ${(user.exp || 0).toLocaleString()}\n` +
            `⭐ Nivel: ${user.level || 1}\n\n` +
            `_${esTuyo ? 'Tu perfil social~ 🌸' : 'Perfil consultado~ 🌸'}_`,
            [target]
        )
    }
}

handler.command = ['casar','marry','aceptar','accept','divorcio','divorce','adoptar','adopt','duelo','duel','aceptarduelo','carta','verificar','perfil']
export default handler
