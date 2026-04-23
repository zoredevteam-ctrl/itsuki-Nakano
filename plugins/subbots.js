/**
 * SUB-BOTS - ITSUKI NAKANO
 * #code — Vincular número como sub-bot
 * #subbots — Ver sub-bots conectados
 * #delsubbot — Eliminar sub-bot
 * #enable code / #disable code — Owner activa/desactiva sistema
 * Detección automática de sesiones cerradas
 * Z0RT SYSTEMS 🌸
 */

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────

const OWNER_NUMBER = global.ownerNumber || '573107400303'

const sendSub = async (conn, m, text) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        `⌨ ${global.botName || 'Itsuki Nakano'}`,
        '𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐒𝐮𝐛-𝐁𝐨𝐭𝐬'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────

let handler = async (m, { conn, command, text, isOwner, db }) => {
    const cmd    = command.toLowerCase()
    const sender = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '').split('@')[0] + '@s.whatsapp.net'
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
            `◈ Usuarios ${activar ? 'pueden' : 'no pueden'} vincular sub-bots. ( ◡‿◡ *)`
        )
    }

    // ── CODE ──────────────────────────────────────────────────────────────────
    if (cmd === 'code') {
        // Verificar si el sistema está habilitado
        if (!db.settings) db.settings = {}
        if (db.settings.codeEnabled === false && !isOwner) {
            return sendSub(conn, m,
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ La vinculación de sub-bots está desactivada en este momento. (－‸－)\n` +
                `◈ Contacta al creador para más información.`
            )
        }

        // Número del usuario que pide el código
        const numero = sender.split('@')[0]

        // Paso 1 — Enviar método de vinculación
        await conn.sendMessage(m.chat, {
            text:
                `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆\n\n` +
                `✧ 𝐌𝐄́𝐓𝐎𝐃𝐎 𝐃𝐄 𝐕𝐈𝐍𝐂𝐔𝐋𝐀𝐂𝐈𝐎́𝐍 ✧\n\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟏 — Comprende el proceso. ( ◡‿◡ *)\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟐 — Copia el código de 8 dígitos que recibirás. (ꈍᴗꈍ)\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟑 — Abre WhatsApp en el número que quieres vincular.\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟒 — Ve a 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨𝐬 𝐯𝐢𝐧𝐜𝐮𝐥𝐚𝐝𝐨𝐬.\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟓 — Selecciona 𝐕𝐢𝐧𝐜𝐮𝐥𝐚𝐫 𝐜𝐨𝐧 𝐧𝐮́𝐦𝐞𝐫𝐨 𝐝𝐞 𝐭𝐞𝐥𝐞́𝐟𝐨𝐧𝐨.\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟔 — Ingresa el número: *+${OWNER_NUMBER}*\n` +
                `↬ ✦ 𝐏𝐚𝐬𝐨 𝟕 — Pega el código y confirma. ٩(◕‿◕)۶\n\n` +
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `◈ 𝐍𝐨𝐭𝐚: Tienes 60 segundos para usarlo. (－‸－)\n` +
                `◈ Si expira, vuelve a ejecutar *${px}code*.\n` +
                `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
            contextInfo: (await (async () => {
                const thumb = await global.getBannerThumb()
                return global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐒𝐮𝐛-𝐁𝐨𝐭𝐬')
            })())
        }, { quoted: m })

        // Esperar 1.5s y enviar el código
        await new Promise(r => setTimeout(r, 1500))

        try {
            // Generar código de vinculación con Baileys
            const code = await conn.requestPairingCode(numero)
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code

            if (!db.subbots) db.subbots = {}
            db.subbots[sender] = {
                jid:       sender,
                numero,
                nombre:    m.pushName || 'Sub-Bot',
                connected: false,
                creado:    new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                code:      formatted,
                codeTime:  Date.now()
            }

            await conn.sendMessage(m.chat, {
                text:
                    `─── ❖ ── ✦ ── ❖ ───\n` +
                    `✦ 𝐂𝐎́𝐃𝐈𝐆𝐎 𝐃𝐄 𝐕𝐈𝐍𝐂𝐔𝐋𝐀𝐂𝐈𝐎́𝐍\n` +
                    `─── ❖ ── ✦ ── ❖ ───\n\n` +
                    `『 *${formatted}* 』\n\n` +
                    `◈ Número: *+${numero}*\n` +
                    `◈ Expira en: *60 segundos*\n` +
                    `◈ Cópialo y pégalo en WhatsApp. (つ≧▽≦)つ\n\n` +
                    `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
                contextInfo: (await (async () => {
                    const thumb = await global.getBannerThumb()
                    return global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐂𝐨́𝐝𝐢𝐠𝐨')
                })())
            }, { quoted: m })

            // Timer: marcar como conectado cuando Baileys detecte la sesión
            setTimeout(async () => {
                if (db.subbots?.[sender] && !db.subbots[sender].connected) {
                    // Si pasaron 60s y no se conectó, limpiar código pero mantener entrada
                    db.subbots[sender].code = null
                }
            }, 65000)

        } catch (e) {
            console.error('[CODE ERROR]', e.message)
            // Fallback: mostrar el número del owner para que lo escriban manualmente
            await conn.sendMessage(m.chat, {
                text:
                    `─── ❖ ── ✦ ── ❖ ───\n` +
                    `✦ 𝐈𝐍𝐒𝐓𝐑𝐔𝐂𝐂𝐈𝐎́𝐍 𝐌𝐀𝐍𝐔𝐀𝐋\n` +
                    `─── ❖ ── ✦ ── ❖ ───\n\n` +
                    `◈ En WhatsApp, ve a 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨𝐬 𝐯𝐢𝐧𝐜𝐮𝐥𝐚𝐝𝐨𝐬.\n` +
                    `◈ Selecciona 𝐕𝐢𝐧𝐜𝐮𝐥𝐚𝐫 𝐜𝐨𝐧 𝐧𝐮́𝐦𝐞𝐫𝐨.\n` +
                    `◈ Ingresa el número: *+${OWNER_NUMBER}*\n` +
                    `◈ Recibirás un código de 8 dígitos. (ꈍᴗꈍ)\n\n` +
                    `◈ 𝐍𝐨𝐭𝐚: Si el error persiste, contacta al creador. (－‸－)\n` +
                    `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
                contextInfo: (await (async () => {
                    const thumb = await global.getBannerThumb()
                    return global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐂𝐨́𝐝𝐢𝐠𝐨')
                })())
            }, { quoted: m })
        }
        return
    }

    // ── SUBBOTS (ver lista) ───────────────────────────────────────────────────
    if (cmd === 'subbots' || cmd === 'botlist' || cmd === 'bots') {
        if (!db.subbots) db.subbots = {}
        const lista = Object.values(db.subbots)
        if (!lista.length) return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐒\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ No hay sub-bots registrados. (⊙_⊙)\n` +
            `◈ Usa *${px}code* para vincular uno. ( ◡‿◡ *)`
        )

        const conectados   = lista.filter(s => s.connected).length
        const desconectados = lista.filter(s => !s.connected).length

        let txt =
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐒\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Total: *${lista.length}* | ✦ Online: *${conectados}* | ✧ Offline: *${desconectados}*\n\n`

        lista.forEach((s, i) => {
            const estado = s.connected ? '✦ Conectado' : '✧ Desconectado'
            txt +=
                `『 𝐒𝐮𝐛-𝐁𝐨𝐭 ${i + 1} 』\n` +
                `↬ Nombre: *${s.nombre || 'Sin nombre'}*\n` +
                `↬ Número: *+${s.numero}*\n` +
                `↬ Estado: *${estado}*\n` +
                `↬ Registrado: *${s.creado || 'N/A'}*\n\n`
        })

        txt += `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`
        return sendSub(conn, m, txt)
    }

    // ── DELSUBBOT (eliminar) ──────────────────────────────────────────────────
    if (cmd === 'delsubbot') {
        if (!isOwner) return sendSub(conn, m,
            `◈ Solo el creador puede eliminar sub-bots. (￣ヘ￣)`
        )
        if (!db.subbots) db.subbots = {}

        // Si menciona a alguien, eliminar ese
        const target = m.quoted?.sender
            ? m.quoted.sender.replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '').split('@')[0] + '@s.whatsapp.net'
            : m.mentionedJid?.[0]?.split('@')[0] + '@s.whatsapp.net'
            || (text || '').trim().replace(/[^0-9]/g, '') + '@s.whatsapp.net'

        if (!target || !db.subbots[target]) {
            // Si no especifica, eliminar todos los desconectados
            const antes = Object.keys(db.subbots).length
            for (const jid of Object.keys(db.subbots)) {
                if (!db.subbots[jid].connected) delete db.subbots[jid]
            }
            const eliminados = antes - Object.keys(db.subbots).length
            return sendSub(conn, m,
                `─── ❖ ── ✦ ── ❖ ───\n` +
                `✦ 𝐋𝐈𝐌𝐏𝐈𝐄𝐙𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀\n` +
                `─── ❖ ── ✦ ── ❖ ───\n\n` +
                `◈ Se eliminaron *${eliminados}* sub-bots desconectados. ( ◡‿◡ *)\n` +
                `◈ Quedan: *${Object.keys(db.subbots).length}* sub-bots.`
            )
        }

        const sub = db.subbots[target]
        delete db.subbots[target]
        return sendSub(conn, m,
            `─── ❖ ── ✦ ── ❖ ───\n` +
            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎\n` +
            `─── ❖ ── ✦ ── ❖ ───\n\n` +
            `◈ Número: *+${sub.numero}*\n` +
            `◈ Nombre: *${sub.nombre || 'Sin nombre'}*\n\n` +
            `◈ Sub-bot eliminado correctamente. ( ◡‿◡ *)`
        )
    }

    // ── SETNOMBRE ─────────────────────────────────────────────────────────────
    if (cmd === 'setnombre' || cmd === 'setname') {
        if (!db.subbots) db.subbots = {}
        if (!db.subbots[sender]) return sendSub(conn, m,
            `◈ No estás registrado como sub-bot. (⊙_⊙)\n◈ Usa *${px}code* primero.`
        )
        const nombre = (text || '').trim()
        if (!nombre) return sendSub(conn, m, `◈ Uso: *${px}setnombre <nombre>*`)
        db.subbots[sender].nombre = nombre
        return sendSub(conn, m,
            `✦ 𝐍𝐨𝐦𝐛𝐫𝐞 𝐚𝐜𝐭𝐮𝐚𝐥𝐢𝐳𝐚𝐝𝐨\n\n◈ Tu sub-bot ahora se llama: *${nombre}* ( ◡‿◡ *)`
        )
    }
}

handler.command = ['code', 'subbots', 'botlist', 'bots', 'delsubbot', 'setnombre', 'setname', 'enable', 'disable']
export default handler
