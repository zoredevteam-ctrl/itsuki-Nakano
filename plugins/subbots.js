/**
 * SUB-BOTS - ITSUKI NAKANO
 * #code — Vincular como sub-bot (muestra numero del bot, no crashea)
 * #subbots — Ver sub-bots registrados
 * #delsubbot — Eliminar sub-bot(s)
 * #enable code / #disable code — Owner activa/desactiva
 * Z0RT SYSTEMS 🌸
 */

const sendSub = async (conn, m, text) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        `⌨ ${global.botName || 'Itsuki Nakano'}`,
        '𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐒𝐮𝐛-𝐁𝐨𝐭𝐬'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const normalizeJid = (jid) =>
    (jid || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '').split('@')[0] + '@s.whatsapp.net'

const getBotNumber = (conn) => {
    try { return conn.user?.id?.split(':')[0]?.split('@')[0] || '' }
    catch { return '' }
}

// Genera código estilo ITSUK1-XXXX-N8
const genCode = () => {
    const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const seg1   = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const seg2   = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `ITSUK1-${seg1}-${seg2}`
}

let handler = async (m, { conn, command, text, isOwner, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const px     = global.prefix || '#'

    // ── ENABLE / DISABLE CODE ─────────────────────────────────────────────────
    if (cmd === 'enable' || cmd === 'disable') {
        if (!isOwner) return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Solo el creador puede gestionar esto. (￣ヘ￣)`
        )
        const arg = (text || '').trim().toLowerCase()
        if (arg !== 'code') return sendSub(conn, m,
            `◈ Uso: *${px}enable code* o *${px}disable code*`
        )
        if (!db.settings) db.settings = {}
        const activar = cmd === 'enable'
        db.settings.codeEnabled = activar
        return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐂𝐎𝐃𝐄 ${activar ? '𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎' : '𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'}\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Estado: *${activar ? '✦ Activo' : '✧ Inactivo'}*\n` +
            `◈ Los usuarios ${activar ? 'pueden' : 'ya no pueden'} vincularse. ( ◡‿◡ *)`
        )
    }

    // ── CODE ──────────────────────────────────────────────────────────────────
    if (cmd === 'code') {
        if (!db.settings) db.settings = {}
        if (db.settings.codeEnabled === false && !isOwner) {
            return sendSub(conn, m,
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ La vinculacion de sub-bots esta desactivada. (－‸－)\n` +
                `◈ Contacta al creador para mas informacion. (ꈍᴗꈍ)`
            )
        }

        const botNumber = getBotNumber(conn)
        if (!botNumber) return sendSub(conn, m,
            `◈ No pude obtener el numero del bot. (°ロ°) !\n◈ Intenta de nuevo.`
        )

        // Generar codigo identificador unico para este usuario
        const codigoId = genCode()
        const numero   = sender.split('@')[0]
        const nombre   = m.pushName || 'Sub-Bot'
        const creado   = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })

        if (!db.subbots) db.subbots = {}
        db.subbots[sender] = {
            jid: sender, numero, nombre,
            connected: false, pendiente: true,
            codigoId, creado
        }

        // ── Mensaje 1: Método de vinculacion ──────────────────────────────────
        await conn.sendMessage(m.chat, {
            text:
                `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆\n\n` +
                `✧ 𝐌𝐄́𝐓𝐎𝐃𝐎 𝐃𝐄 𝐕𝐈𝐍𝐂𝐔𝐋𝐀𝐂𝐈𝐎́𝐍 ✧\n\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟏 — Abre WhatsApp en el numero que quieres vincular. ( ◡‿◡ *)\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟐 — Ve a 𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐜𝐢𝐨𝐧 ➜ 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨𝐬 𝐯𝐢𝐧𝐜𝐮𝐥𝐚𝐝𝐨𝐬. (ꈍᴗꈍ)\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟑 — Pulsa 𝐕𝐢𝐧𝐜𝐮𝐥𝐚𝐫 𝐜𝐨𝐧 𝐧𝐮́𝐦𝐞𝐫𝐨 𝐝𝐞 𝐭𝐞𝐥𝐞́𝐟𝐨𝐧𝐨. (〃￣ω￣〃)\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟒 — Ingresa el numero del bot que te dare enseguida.\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟓 — WhatsApp generara un codigo de 8 digitos automaticamente.\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟔 — Ingresalo y quedas vinculado. ٩(◕‿◕)۶\n\n` +
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `◈ 𝐍𝐨𝐭𝐚: El codigo expira en 60 segundos. (－‸－)\n` +
                `◈ Si expira, vuelve a escribir *${px}code*.\n` +
                `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
            contextInfo: (await (async () => {
                const thumb = await global.getBannerThumb()
                return global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐕𝐢𝐧𝐜𝐮𝐥𝐚𝐜𝐢𝐨𝐧')
            })())
        }, { quoted: m })

        // Pequeña pausa entre mensajes
        await new Promise(r => setTimeout(r, 1500))

        // ── Mensaje 2: Numero del bot ─────────────────────────────────────────
        await conn.sendMessage(m.chat, {
            text:
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐍𝐔́𝐌𝐄𝐑𝐎 𝐃𝐄𝐋 𝐁𝐎𝐓\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `『 *+${botNumber}* 』\n\n` +
                `◈ Ingresa este numero en WhatsApp cuando te lo pida. (つ≧▽≦)つ\n` +
                `◈ WhatsApp generara el codigo automaticamente. ( ◡‿◡ *)\n\n` +
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐓𝐔 𝐈𝐃𝐄𝐍𝐓𝐈𝐅𝐈𝐂𝐀𝐃𝐎𝐑\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `『 *${codigoId}* 』\n\n` +
                `◈ Guarda este ID, identifica tu sub-bot en el sistema. (ꈍᴗꈍ)\n` +
                `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
            contextInfo: (await (async () => {
                const thumb = await global.getBannerThumb()
                return global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐍𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥 𝐁𝐨𝐭')
            })())
        }, { quoted: m })

        return
    }

    // ── SUBBOTS ───────────────────────────────────────────────────────────────
    if (cmd === 'subbots' || cmd === 'botlist' || cmd === 'bots') {
        if (!isOwner) return sendSub(conn, m,
            `◈ Solo el creador puede ver los sub-bots. (￣ヘ￣)`
        )
        if (!db.subbots) db.subbots = {}
        const lista = Object.values(db.subbots)

        if (!lista.length) return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ No hay sub-bots registrados. (⊙_⊙)\n` +
            `◈ Los usuarios pueden vincularse con *${px}code*. ( ◡‿◡ *)`
        )

        const conectados    = lista.filter(s => s.connected).length
        const desconectados = lista.filter(s => !s.connected && !s.pendiente).length
        const pendientes    = lista.filter(s => s.pendiente).length

        let txt =
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐒\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Total: *${lista.length}*\n` +
            `↬ ✦ Conectados: *${conectados}*\n` +
            `↬ ✧ Desconectados: *${desconectados}*\n` +
            `↬ ◇ Pendientes: *${pendientes}*\n\n`

        lista.forEach((s, i) => {
            const estado = s.connected ? '✦ Conectado' : s.pendiente ? '◇ Pendiente vinculacion' : '✧ Desconectado'
            txt +=
                `『 𝐒𝐮𝐛-𝐁𝐨𝐭 ${i + 1} 』\n` +
                `↬ Nombre: *${s.nombre || 'Sin nombre'}*\n` +
                `↬ Numero: *+${s.numero}*\n` +
                `↬ ID: \`${s.codigoId || 'N/A'}\`\n` +
                `↬ Estado: *${estado}*\n` +
                `↬ Registro: *${s.creado || 'N/A'}*\n\n`
        })

        txt += `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`
        return sendSub(conn, m, txt)
    }

    // ── DELSUBBOT ─────────────────────────────────────────────────────────────
    if (cmd === 'delsubbot') {
        if (!isOwner) return sendSub(conn, m,
            `◈ Solo el creador puede eliminar sub-bots. (￣ヘ￣)`
        )
        if (!db.subbots) db.subbots = {}

        const targetRaw = m.quoted?.sender || m.mentionedJid?.[0]
        const targetNum = (text || '').trim().replace(/[^0-9]/g, '')

        let targetJid = null
        if (targetRaw)   targetJid = normalizeJid(targetRaw)
        else if (targetNum) targetJid = targetNum + '@s.whatsapp.net'

        if (targetJid && db.subbots[targetJid]) {
            const sub = db.subbots[targetJid]
            delete db.subbots[targetJid]
            return sendSub(conn, m,
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Numero: *+${sub.numero}*\n` +
                `◈ Nombre: *${sub.nombre || 'Sin nombre'}*\n` +
                `◈ ID: \`${sub.codigoId || 'N/A'}\`\n\n` +
                `◈ Eliminado correctamente. ( ◡‿◡ *)`
            )
        }

        // Sin argumento → limpiar desconectados y pendientes
        const antes = Object.keys(db.subbots).length
        for (const jid of Object.keys(db.subbots)) {
            if (!db.subbots[jid].connected) delete db.subbots[jid]
        }
        const eliminados = antes - Object.keys(db.subbots).length
        return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐋𝐈𝐌𝐏𝐈𝐄𝐙𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Se eliminaron *${eliminados}* sub-bots inactivos. ( ◡‿◡ *)\n` +
            `◈ Quedan activos: *${Object.keys(db.subbots).length}*`
        )
    }

    // ── SETNOMBRE ─────────────────────────────────────────────────────────────
    if (cmd === 'setnombre' || cmd === 'setname') {
        if (!db.subbots) db.subbots = {}
        if (!db.subbots[sender]) return sendSub(conn, m,
            `◈ No estas registrado como sub-bot. (⊙_⊙)\n` +
            `◈ Usa *${px}code* primero. (ꈍᴗꈍ)`
        )
        const nombre = (text || '').trim()
        if (!nombre) return sendSub(conn, m, `◈ Uso: *${px}setnombre <nombre>*`)
        db.subbots[sender].nombre = nombre.slice(0, 40)
        return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐍𝐎𝐌𝐁𝐑𝐄 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Tu sub-bot ahora se llama: *${nombre}* ( ◡‿◡ *)`
        )
    }
}

handler.command = ['code','subbots','botlist','bots','delsubbot','setnombre','setname','enable','disable']
export default handler
