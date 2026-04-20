import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export default {
  command: ['check', 'test', 'error', 'verificar'],
  category: 'owner',
  run: async (m, { conn }) => {
    if (!m.isOwner) return

    const pluginsDir = path.join(process.cwd(), 'plugins')

    if (!fs.existsSync(pluginsDir)) {
      return m.reply('⚠️ *No se encontró la carpeta `plugins`.*')
    }

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

    let report = `👑 ─── 𝖲𝖸𝖲𝖳𝖤𝖬 𝖢𝖧𝖤𝖢𝖪 ─── 👑\n\n`
    const errors = []
    let total = 0

    await m.reply('🌷 *Iniciando diagnóstico de protocolos...* ✨')

    for (const file of files) {
      total++
      try {
        const filePath = pathToFileURL(path.join(pluginsDir, file)).href + `?update=${Date.now()}`
        await import(filePath)
      } catch (e) {
        errors.push({
          file,
          error: e?.message || String(e)
        })
      }
    }

    if (errors.length === 0) {
      report += `✅ *¡Felicidades, Aarom!*\nTodos los protocolos (${total}) se encuentran en estado óptimo. No se detectaron fallos de sintaxis. 🌟`
    } else {
      report += `⚠️ *Se han detectado anomalías:*\nSe encontraron errores en ${errors.length} de ${total} archivos analizados.\n\n`

      errors.forEach((err, i) => {
        report += `*${i + 1}. Archivo:* ${err.file}\n`
        report += `*📛 Error:* ${err.error}\n`
        report += `──────────────\n`
      })

      report += `\n> ✨ _Por favor, revise los archivos mencionados para restaurar la estabilidad del sistema._ 🌷`
    }

    await conn.sendMessage(
      m.chat,
      {
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
      },
      { quoted: m }
    )
  }
}