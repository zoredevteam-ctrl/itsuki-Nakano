/**
 * EVENTS/CONNECTION.JS - ITSUKI NAKANO
 * Detecta cuando un sub-bot cierra sesión y lo elimina automáticamente
 * Z0RT SYSTEMS 🌸
 */

import { database } from '../lib/database.js'

export const event = 'connection.update'

export const run = async (conn, update) => {
    try {
        const { connection, lastDisconnect, qr } = update

        // Solo procesar desconexiones
        if (connection !== 'close') return

        const statusCode = lastDisconnect?.error?.output?.statusCode
        const reason     = lastDisconnect?.error?.output?.payload?.message || ''

        console.log('[CONNECTION] Estado:', connection, '| Código:', statusCode, '| Razón:', reason)

        // Códigos que indican sesión cerrada/borrada por el usuario
        const SESION_CERRADA = [401, 440, 515]
        const esSesionBorrada = SESION_CERRADA.includes(statusCode) ||
            reason.includes('logged out') ||
            reason.includes('Stream Errored') ||
            reason.includes('Connection Closed')

        if (!esSesionBorrada) return

        // Buscar en la base de datos si este bot es un sub-bot
        const db      = database.data
        const myJid   = conn?.user?.id?.replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '').split('@')[0] + '@s.whatsapp.net'
        const subbots = db?.subbots || {}

        if (subbots[myJid]) {
            console.log('[CONNECTION] Sub-bot desconectado detectado:', myJid)

            // Marcar como desconectado
            subbots[myJid].connected    = false
            subbots[myJid].ultimoOnline = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
            subbots[myJid].razonDesconexion = `${statusCode} — ${reason}`

            // Notificar al owner
            const ownerJid = (global.ownerNumber || global.owner?.[0]?.[0] || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            if (ownerJid && ownerJid !== '@s.whatsapp.net') {
                try {
                    const thumb = await global.getBannerThumb?.() || null
                    const ctx   = global.getNewsletterCtx?.(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐒𝐮𝐛-𝐁𝐨𝐭𝐬') || {}

                    await conn.sendMessage(ownerJid, {
                        text:
                            `─── ❖ ── ✦ ── ❖ ───\n` +
                            `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓 𝐃𝐄𝐒𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎\n` +
                            `─── ❖ ── ✦ ── ❖ ───\n\n` +
                            `◈ Número: *+${myJid.split('@')[0]}*\n` +
                            `◈ Nombre: *${subbots[myJid].nombre || 'Sin nombre'}*\n` +
                            `◈ Razón: *${reason || 'Sesión cerrada'}*\n` +
                            `◈ Código: *${statusCode}*\n` +
                            `◈ Hora: *${subbots[myJid].ultimoOnline}*\n\n` +
                            `◈ La sesión fue eliminada automáticamente. ( ◡‿◡ *)\n` +
                            `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
                        contextInfo: ctx
                    })
                } catch (e) {
                    console.log('[CONNECTION] No pude notificar al owner:', e.message)
                }
            }

            // Si la sesión fue borrada por el usuario (401 = logged out), eliminar el sub-bot de la DB
            if (statusCode === 401 || reason.includes('logged out')) {
                delete subbots[myJid]
                console.log('[CONNECTION] Sub-bot eliminado de DB:', myJid)
            }
        }
    } catch (e) {
        console.error('[CONNECTION EVENT ERROR]', e.message)
    }
}
