let handler = async (m, { conn, usedPrefix }) => {
    try {
        // Obtenemos la fecha exacta usando código nativo (Sin instalar moment)
        const date = new Intl.DateTimeFormat('es-CO', {
            timeZone: 'America/Bogota',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date())

        let menuText = `
👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖭𝖠𝖪𝖠𝖭𝖮 𝖲𝖸𝖲𝖳𝖤𝖬 ─── 👑

🌷 *Sea usted bienvenido. He organizado cuidadosamente cada sección para que su experiencia sea eficiente y ordenada. ✨*

╔════════════════════════╗
┃  🌟 **﹝ 𝖱𝖤𝖯𝖮𝖱𝖳𝖤 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ﹞**
┠───────────────┈ ✨
┃ ❃ **𝖣𝖾𝗌𝖺𝗋𝗋𝗈𝗅𝗅𝖺𝖽𝗈𝗋:** Aarom 👑
┃ ❃ **𝖯𝗋𝖾𝖿𝗂𝗃𝗈:** [ ${usedPrefix} ] 🌟
┃ ❃ **𝖥𝖾𝖼𝗁𝖺:** ${date} 🌺
┃ ❃ **𝖤𝗌𝗍𝖺𝖽𝗈:** Operativo 🌷
╚════════════════════════╝

◈━━━━━━━━━ 🌟 ━━━━━━━━━◈
  ✨  **﹝ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖯𝖱𝖮𝖳𝖮𝖢𝖮𝖫𝖮𝖲 ﹞** ✨
◈━━━━━━━━━━━━━━━━━━━━━◈

    🌷 ◈ ${usedPrefix}donar
    🌺 ◈ ${usedPrefix}ping
    👑 ◈ ${usedPrefix}owner
    🌟 ◈ ${usedPrefix}play
    ✨ ◈ ${usedPrefix}sticker
    🌷 ◈ ${usedPrefix}tiktok

◈━━━━━━━━━━━━━━━━━━━━━◈

> *“Estudiar no es solo memorizar, es entender el mundo. Por favor, proceda con determinación y no pierda de vista sus objetivos.”* ✍️ ✨

🌟 ━━━━━━━━━━━━━━━━━━ 🌟
🌺 *Espero que este orden sea de su agrado. Estaré aquí si requiere asistencia adicional.* 🌷`.trim()

        // Obtenemos la imagen del banner y el contexto del newsletter
        let thumbnail = await global.getBannerThumb()
        let context = global.getNewsletterCtx(
            thumbnail, 
            '🌟 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐘𝐒𝐓𝐄𝐌', 
            'Menú Principal de Asistencia 🌺'
        )

        // Enviamos el mensaje
        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: context
        }, { quoted: m })

    } catch (e) {
        console.error('[ERROR EN MENU]:', e)
        m.reply(`💢 *¡Oh no, hubo un error al cargar mis apuntes!* 😔\nPor favor, avísale a Aarom para que lo revise. 🍀`)
    }
}

// Comandos que activan este menú
handler.command = ['menu', 'allmenu', 'help', 'comandos']
export default handler
