/**
 * SOCIAL PLUS - ITSUKI NAKANO
 * #cumpleanos #regalo #confesar #amistad #miperfil #reputacion #trofeos
 * Z0RT SYSTEMS 🌸
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const sendSP = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `💕 ${global.botName||'Itsuki Nakano'}`, 'Social Plus')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const normalizeJid = (jid) => jid?.split('@')[0]?.split(':')[0] + '@s.whatsapp.net'

const ensureUser = (db, jid) => {
    if (!db.users) db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    const d = { money:0, bank:0, exp:0, level:1, wins:0, reputacion:0, amigos:[], trofeos:[], cumpleanos:'', regalosEnviados:0, regalosRecibidos:0 }
    for(const[k,v] of Object.entries(d)) if(db.users[jid][k]===undefined) db.users[jid][k]=v
    return db.users[jid]
}

const REGALOS = [
    { emoji:'🌸', nombre:'Ramo de flores', valor:20 },
    { emoji:'🍡', nombre:'Mochi especial', valor:30 },
    { emoji:'📚', nombre:'Libro de historia', valor:50 },
    { emoji:'🍜', nombre:'Ramen gourmet', valor:40 },
    { emoji:'💎', nombre:'Gema preciosa', valor:200 },
    { emoji:'🎁', nombre:'Caja misteriosa', valor:100 },
    { emoji:'🌺', nombre:'Corona de flores', valor:80 },
    { emoji:'🍰', nombre:'Pastel de sakura', valor:60 },
    { emoji:'⚔️', nombre:'Katana decorativa', valor:150 },
    { emoji:'🎀', nombre:'Moño especial', valor:25 }
]

const TROFEOS = [
    { id:'primer_win',  emoji:'🥇', nombre:'Primera Victoria', condicion:'Primera vez que ganas algo' },
    { id:'rico',        emoji:'💰', nombre:'Millonario', condicion:'Tener 1000+ Flores' },
    { id:'social',      emoji:'💕', nombre:'Alma Social', condicion:'Tener 5+ amigos' },
    { id:'generoso',    emoji:'🎁', nombre:'Generoso', condicion:'Enviar 10+ regalos' },
    { id:'explorador',  emoji:'🗺️', nombre:'Explorador', condicion:'Usar 10+ comandos diferentes' },
    { id:'veterano',    emoji:'⭐', nombre:'Veterano', condicion:'Nivel 10 o superior' }
]

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const u      = ensureUser(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const px     = global.prefix || '#'

    // ── CUMPLEAÑOS ────────────────────────────────────────────────────────────
    if (cmd === 'cumpleanos' || cmd === 'birthday' || cmd === 'nacimiento') {
        const fecha = args[0] || ''
        if (!fecha) {
            if (u.cumpleanos) return sendSP(conn, m,
                `🎂 *TU CUMPLEAÑOS*\n\n📅 Registrado: *${u.cumpleanos}*\n\n_¡Itsuki no lo olvidará~ 🌸_`
            )
            return sendSP(conn, m, `🎂 Registra tu cumpleaños:\n_Uso: *${px}cumpleanos DD/MM*_\n_Ejemplo: ${px}cumpleanos 25/12_ 🌸`)
        }
        if (!/^\d{1,2}\/\d{1,2}$/.test(fecha)) return sendSP(conn, m, `❌ Formato inválido. Usa *DD/MM*\n_Ejemplo: ${px}cumpleanos 25/12_`)
        u.cumpleanos = fecha
        return sendSP(conn, m,
            `🎂 *¡CUMPLEAÑOS REGISTRADO!*\n\n📅 Fecha: *${fecha}*\n\n_Itsuki recordará tu día especial~ 🌸🎉_`
        )
    }

    // ── REGALO ────────────────────────────────────────────────────────────────
    if (cmd === 'regalo' || cmd === 'gift') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target) return sendSP(conn, m,
            `🎁 *TIENDA DE REGALOS*\n\n` +
            REGALOS.map((r,i) => `${i+1}. ${r.emoji} *${r.nombre}* — ${r.valor} Flores`).join('\n') +
            `\n\nUso: *${px}regalo @usuario <número>*\n_Ejemplo: ${px}regalo @amigo 1_ 🌸`
        )
        if (target === sender) return sendSP(conn, m, `😂 No puedes regalarte a ti mismo~`)
        const idx = parseInt(args.find(a => /^\d+$/.test(a))||'0') - 1
        if (idx < 0 || idx >= REGALOS.length) return sendSP(conn, m,
            `❌ Número inválido. Elige del 1 al ${REGALOS.length}~`
        )
        const regalo = REGALOS[idx]
        if ((u.money||0) < regalo.valor) return sendSP(conn, m,
            `❌ No tienes suficiente\n💰 Necesitas: *${regalo.valor} Flores*\n💰 Tienes: *${u.money||0} Flores*`
        )
        u.money -= regalo.valor; u.regalosEnviados = (u.regalosEnviados||0)+1
        ensureUser(db, target)
        db.users[target].regalosRecibidos = (db.users[target].regalosRecibidos||0)+1
        db.users[target].money = (db.users[target].money||0) + Math.floor(regalo.valor * 0.5)
        return conn.sendMessage(m.chat, {
            text:
                `🎁 *¡REGALO ENVIADO!*\n\n` +
                `De: @${sender.split('@')[0]}\nPara: @${target.split('@')[0]}\n\n` +
                `${regalo.emoji} *${regalo.nombre}*\n💰 Costó: *${regalo.valor} Flores*\n\n` +
                `_¡Con todo el cariño de Itsuki!~ 🌸_`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🎁 ${global.botName||'Itsuki Nakano'}`,'Regalos') })())
        }, { quoted: m })
    }

    // ── CONFESAR ──────────────────────────────────────────────────────────────
    if (cmd === 'confesar' || cmd === 'confess') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        const msg    = text?.replace(/@\d+/g,'').trim()
        if (!target || !msg) return sendSP(conn, m,
            `💌 Uso: *${px}confesar @usuario <mensaje secreto>*\n_Ejemplo: ${px}confesar @amigo Me gustas desde siempre~_ 🌸`
        )
        if (target === sender) return sendSP(conn, m, `😂 No puedes confesarte a ti mismo~`)
        return conn.sendMessage(m.chat, {
            text:
                `💌 *CONFESIÓN ANÓNIMA*\n\n` +
                `Para: @${target.split('@')[0]}\n\n` +
                `╔════ ❀ ════╗\n` +
                `💕 _${msg}_\n` +
                `╚════ ❀ ════╝\n\n` +
                `_Con todo el cariño~ 🌸_`,
            mentions: [target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`💌 ${global.botName||'Itsuki Nakano'}`,'Confesión') })())
        }, { quoted: m })
    }

    // ── AMISTAD ───────────────────────────────────────────────────────────────
    if (cmd === 'amistad' || cmd === 'friend' || cmd === 'amigo') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target) return sendSP(conn, m, `💕 Menciona a alguien para hacerlo tu amigo~\n_Uso: ${px}amistad @usuario_ 🌸`)
        if (target === sender) return sendSP(conn, m, `😂 Ya eres tu propio mejor amigo~ 🌸`)
        if (!u.amigos) u.amigos = []
        if (u.amigos.includes(target)) return sendSP(conn, m,
            `💕 @${target.split('@')[0]} ya es tu amigo~ 🌸`, [target]
        )
        u.amigos.push(target)
        ensureUser(db, target)
        if (!db.users[target].amigos) db.users[target].amigos = []
        if (!db.users[target].amigos.includes(sender)) db.users[target].amigos.push(sender)
        return conn.sendMessage(m.chat, {
            text:
                `💕 *¡NUEVA AMISTAD!*\n\n` +
                `@${sender.split('@')[0]} y @${target.split('@')[0]} ahora son amigos~ 🌸\n\n` +
                `_¡Que su amistad dure para siempre!_ 🎉`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`💕 ${global.botName||'Itsuki Nakano'}`,'Amistad') })())
        }, { quoted: m })
    }

    // ── PERFIL COMPLETO ───────────────────────────────────────────────────────
    if (cmd === 'miperfil' || cmd === 'profile') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : sender
        ensureUser(db, target)
        const user    = db.users[target]
        const esTuyo  = target === sender
        const trofeos = (user.trofeos||[]).map(t => TROFEOS.find(x=>x.id===t)?.emoji||'⭐').join('') || 'Ninguno'
        return sendSP(conn, m,
            `👤 *PERFIL — @${target.split('@')[0]}*\n\n` +
            `${user.cumpleanos ? `🎂 Cumpleaños: *${user.cumpleanos}*\n` : ''}` +
            `💰 Flores: *${(user.money||0).toLocaleString()}*\n` +
            `🏦 Banco: *${(user.bank||0).toLocaleString()}*\n` +
            `✨ Exp: *${(user.exp||0).toLocaleString()}*\n` +
            `⭐ Nivel: *${user.level||1}*\n` +
            `🏆 Victorias: *${user.wins||0}*\n` +
            `💕 Amigos: *${(user.amigos||[]).length}*\n` +
            `💍 Pareja: *${user.pareja ? `@${user.pareja.split('@')[0]}` : 'Soltero/a'}*\n` +
            `🎁 Regalos enviados: *${user.regalosEnviados||0}*\n` +
            `📬 Regalos recibidos: *${user.regalosRecibidos||0}*\n` +
            `🏅 Trofeos: ${trofeos}\n\n` +
            `_${esTuyo ? 'Tu perfil completo~ 🌸' : 'Perfil consultado~ 🌸'}_`,
            [target]
        )
    }

    // ── REPUTACIÓN ────────────────────────────────────────────────────────────
    if (cmd === 'rep' || cmd === 'reputacion') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target) {
            return sendSP(conn, m,
                `⭐ *TU REPUTACIÓN*\n\n⭐ Puntos: *${u.reputacion||0}*\n\n_Menciona a alguien para darle reputación: *${px}rep @usuario*_ 🌸`
            )
        }
        if (target === sender) return sendSP(conn, m, `😂 No puedes darte reputación a ti mismo~`)
        ensureUser(db, target)
        db.users[target].reputacion = (db.users[target].reputacion||0) + 1
        return conn.sendMessage(m.chat, {
            text:
                `⭐ *¡REPUTACIÓN DADA!*\n\n` +
                `@${target.split('@')[0]} recibió +1 reputación de @${sender.split('@')[0]} 🌸\n` +
                `⭐ Total: *${db.users[target].reputacion}*`,
            mentions: [target, sender],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`⭐ ${global.botName||'Itsuki Nakano'}`,'Reputación') })())
        }, { quoted: m })
    }

    // ── TROFEOS ───────────────────────────────────────────────────────────────
    if (cmd === 'trofeos' || cmd === 'logros' || cmd === 'achievements') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : sender
        ensureUser(db, target)
        const user      = db.users[target]
        const obtenidos = user.trofeos || []
        const lista     = TROFEOS.map(t =>
            `${obtenidos.includes(t.id) ? '✅' : '🔒'} ${t.emoji} *${t.nombre}*\n   _${t.condicion}_`
        ).join('\n\n')
        return sendSP(conn, m,
            `🏅 *TROFEOS — @${target.split('@')[0]}*\n\n` +
            `${lista}\n\n` +
            `_${obtenidos.length}/${TROFEOS.length} desbloqueados~ 🌸_`,
            [target]
        )
    }

    // ── ESTADO / BIO ──────────────────────────────────────────────────────────
    if (cmd === 'bio' || cmd === 'setbio') {
        if (!text) return sendSP(conn, m, `📝 Usa: *${px}bio <tu descripción>*\n_Ejemplo: ${px}bio Amante del anime~ 🌸_`)
        if (text.length > 100) return sendSP(conn, m, `❌ Máximo 100 caracteres~`)
        u.bio = text
        return sendSP(conn, m, `📝 *¡BIO ACTUALIZADA!*\n\n_"${text}"_ 🌸`)
    }
}

handler.command = ['cumpleanos','birthday','nacimiento','regalo','gift','confesar','confess','amistad','friend','amigo','miperfil','profile','rep','reputacion','trofeos','logros','achievements','bio','setbio']
export default handler
