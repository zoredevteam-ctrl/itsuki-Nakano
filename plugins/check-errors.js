import fs from 'fs'
import path from 'path'

export default {
    command: ['check', 'test', 'error', 'verificar'],
    category: 'owner',
    run: async (m, { conn, usedPrefix, command }) => {
        // Solo tú puedes usar este comando de diagnóstico
        if (!m.isOwner) return

        const pluginsDir = path.join(process.cwd(), 'plugins')
        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
        
        let report = `👑 ─── 𝖲𝖸𝖲𝖳𝖤𝖬 𝖢𝖧𝖤𝖢𝖪 ─── 👑\n\n`
        let errors = []
        let total = 0

        // Aviso de inicio
        await m.reply('🌷 *Iniciando diagnóstico de protocolos...* ✨')

        for (const file of files) {
            total++
            try {
                // Intentamos importar el archivo con un bypass de caché para verificarlo
                await import(path.join(pluginsDir, file) + `?update=${Date.now()}`)
            } catch (e) {
                errors.push({ file, error: e.message })
            }
        }

        if (errors.length === 0) {
            report += `✅ *¡Felicidades, Aarom!*
Todos los protocolos (${total}) se encuentran en estado óptimo. No se detectaron fallos de sintaxis. 🌟`
        } else {
            report += `⚠️ *Se han detectado anomalías:*
Se encontraron errores en ${errors.length} de ${total} archivos analizados.\n\n`
            
            errors.forEach((err, i) => {
                report += `*${i + 1}. Archivo:* ${err.file}\n`
                report += `*📛 Error:* ${err.error}\n`
                report += `──────────────\n`
            })
            
            report += `\n> ✨ _Por favor, revise los archivos mencionados para restaurar la estabilidad del sistema._ 🌷`
        }

        await conn.sendMessage(m.chat, {
            text: report,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: {
                    title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
                    body: 'Diagnóstico de Seguridad ✨',
                    mediaType: 1,
                    thumbnailUrl: global.banner,
                    sourceUrl: global.rcanal
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                    newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    }
}
