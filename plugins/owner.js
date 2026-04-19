let handler = async (m, { conn }) => {
    const number = '573107400303'
    const name = '𝓐𝓪𝓻𝓸𝓶'

    // Formato de la tarjeta de contacto (vCard)
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${name};;;\nFN:${name}\nORG:Itsuki Nakano System\nTITLE:Desarrollador Principal\nTEL;type=CELL;type=VOICE;waid=${number}:+${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}\nEND:VCARD`

    // Texto con la personalidad de Itsuki
    const introText = `🌷 *Saludos.* Es un honor presentarle a mi creador y desarrollador principal, *${name}*.\n\n> _Si encuentra algún error en mi sistema o requiere adquirir mis servicios, puede contactarlo. Le pido amablemente que sea directo y respetuoso al escribirle._ ✍️✨`

    // 1. Enviamos el mensaje de presentación con el AdReply y Newsletter
    await conn.sendMessage(m.chat, {
        text: introText,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
                title: '👑 𝐂𝐨𝐧𝐭𝐚𝐜𝐭𝐨 𝐝𝐞𝐥 𝐂𝐫𝐞𝐚𝐝𝐨𝐫',
                body: 'Itsuki Nakano System 🌺',
                mediaType: 1,
                thumbnailUrl: global.banner || 'https://upload.yotsuba.giize.com/u/FkriIp0S.webp',
                renderLargerThumbnail: true, // Esto hace que la imagen se vea en grande
                sourceUrl: global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                serverMessageId: -1
            }
        }
    }, { quoted: m })

    // 2. Enviamos el contacto (vCard) justo después
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: name,
            contacts: [{ vcard }]
        }
    }, { quoted: m })
}

// Se activa con cualquiera de estos comandos
handler.command = ['owner', 'creador', 'contacto', 'desarrollador']
export default handler
