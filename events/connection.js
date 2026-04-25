/**
 * EVENTS/CONNECTION.JS - ITSUKI NAKANO
 * Detecta cuando un sub-bot cierra sesion REAL y lo elimina automaticamente
 * IGNORA errores 500/503 (Stream Errored) — son reconexiones normales
 * Z0RT SYSTEMS 🌸
 */

import { database } from '../lib/database.js'

export const event = 'connection.update'

export const run = async (conn, update) => {
    try {
        const { connection, lastDisconnect } = update
        if (connection !== 'close') return

        const statusCode = lastDisconnect?.error?.output?.statusCode
        const reason     = lastDisconnect?.error?.message || ''

        console.log(`[CONNECTION] Estado: close | Código: ${statusCode} | Razón: ${reason}`)

        // ── IGNORAR — estos son errores de red normales, NO cierres de sesión ──
        // 500 = Internal server error (Baileys interno)
        // 503 = Stream Errored (reconexión normal)
        // 408 = Request Timeout
        // undefined = desconexión sin razón clara
        const IGNORAR = [500, 503, 408, undefined, null]
        if (IGNORAR.includes(statusCode)) return

        // ── SOLO actuar en cierre REAL de sesión ──────────────────────────────
        // 401 = Logged out (usuario cerró sesión desde WhatsApp)
        // 440 = Replaced (otra instancia tomó el control)
        const SESION_CERRADA = [401, 440]
        const esCierrReal = SESION_CERRADA.includes(statusCode) ||
            reason.toLowerCase().includes('logged out')

        if (!esCierrReal) return

        // ── Buscar si es un sub-bot registrado ────────────────────────────────
        const db     = database.data
        const myJid  = (conn?.user?.id || '').split(':')[0].split('@')[0] + '@s.whatsapp.net'
        const subbots = db?.subbots || {}

        if (!subbots[myJid]) return // No es sub-bot registrado, ignorar

        console.log(`[CONNECTION] Sub-bot desconectado REAL: ${myJid} | Código: ${statusCode}`)

        // Marcar como desconectado
        subbots[myJid].connected         = false
        subbots[myJid].pendiente         = false
        subbots[myJid].ultimoOnline      = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
        subbots[myJid].razonDesconexion  = `${statusCode} — ${reason}`

        // Si fue logout real (401), eliminar de la DB automaticamente
        if (statusCode === 401 || reason.toLowerCase().includes('logged out')) {
            delete subbots[myJid]
            console.log(`[CONNECTION] Sub-bot eliminado de DB: ${myJid}`)
        }

        // Notificar al owner
        const ownerNum = (global.ownerNumber || '')
            || (Array.isArray(global.owner) ? (Array.isArray(global.owner[0]) ? global.owner[0][0] : global.owner[0]) : '')
        const ownerJid = String(ownerNum).replace(/[^0-9]/g, '') + '@s.whatsapp.net'

        if (!ownerJid || ownerJid === '@s.whatsapp.net') return

        try {
            const thumb = typeof global.getBannerThumb === 'function' ? await global.getBannerThumb() : null
            const ctx   = typeof global.getNewsletterCtx === 'function'
                ? global.getNewsletterCtx(thumb, `⌨ ${global.botName || 'Itsuki Nakano'}`, '𝐒𝐮𝐛-𝐁𝐨𝐭𝐬')
                : {}

            await conn.sendMessage(ownerJid, {
                text:
                    `─── ❖ ── ✦ ── ❖ ───\n` +
                    `✦ 𝐒𝐔𝐁-𝐁𝐎𝐓 𝐃𝐄𝐒𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎\n` +
                    `─── ❖ ── ✦ ── ❖ ───\n\n` +
                    `◈ Numero: *+${myJid.split('@')[0]}*\n` +
                    `◈ Razon: *${reason || 'Sesion cerrada'}*\n` +
                    `◈ Codigo: *${statusCode}*\n` +
                    `◈ Hora: *${subbots[myJid]?.ultimoOnline || new Date().toLocaleString('es-CO')}*\n\n` +
                    `◈ ${statusCode === 401 ? 'La sesion fue eliminada automaticamente.' : 'Marcado como desconectado.'} ( ◡‿◡ *)\n` +
                    `⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆`,
                contextInfo: ctx
            })
        } catch (e) {
            console.log('[CONNECTION] No pude notificar al owner:', e.message)
        }

    } catch (e) {
        console.error('[CONNECTION EVENT ERROR]', e.message)
    }
}
