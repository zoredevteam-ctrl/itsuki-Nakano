import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// ————————————————————————————————————————————————————————————————————
// CONFIGURACIÓN DE IDENTIDAD 🍀
// ————————————————————————————————————————————————————————————————————

global.botName    = 'Itsuki Nakano'
global.ownerName  = '𝓐𝓪𝓻𝓸𝓶 𝓞𝔀𝓷𝓮𝓻 🍀'
global.botVersion = '1.0.0'

global.owner = [
  ['573107400303', 'Aarom 🍀', true],
  ['123613520896125', 'Aarom LID 🍀', true]
]

global.owners = global.owner.map(v => v[0])
global.mods   = []
global.prems  = []

global.prefix = '#'

// ————————————————————————————————————————————————————————————————————
// ENLACES Y VISUALES 🍀
// ————————————————————————————————————————————————————————————————————

global.rcanal = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'

// ✅ JID del newsletter para el botón de seguir canal
global.newsletterJid  = '120363404822730259@newsletter'
global.newsletterName = '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪'

// Banner principal
global.banner = 'https://causas-files.vercel.app/fl/q2hx.jpg'

// ————————————————————————————————————————————————————————————————————
// BANNER CONTEXTUAL 🍀
// ————————————————————————————————————————————————————————————————————

global.getActiveBanner = (db = null) => {
    const subbotId = global._currentSubbotId
    if (subbotId && db?.subbots?.[subbotId]?.banner) {
        return db.subbots[subbotId].banner
    }
    return global.banner
}

global.getBannerThumb = async (db = null) => {
    try {
        const url = global.getActiveBanner(db)
        const res = await fetch(url)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

// ————————————————————————————————————————————————————————————————————
// NEWSLETTER CONTEXT 🍀
// ————————————————————————————————————————————————————————————————————

global.getNewsletterCtx = (thumbnail = null, title = null, body = null) => {
    return {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid:  global.newsletterJid,
            serverMessageId: '',
            newsletterName:  global.newsletterName
        },
        externalAdReply: {
            title:    title || `🍀 ${global.botName}`,
            body:     body  || 'Itsuki Nakano Bot 🍀',
            mediaType: 1,
            mediaUrl:  global.rcanal,
            sourceUrl: global.rcanal,
            thumbnail,
            showAdAttribution:  false,
            containsAutoReply:  true,
            renderLargerThumbnail: false
        }
    }
}

// ————————————————————————————————————————————————————————————————————
// MENSAJES DE SISTEMA (Estilo Itsuki — dulce, estudiosa, hambrienta 🍀)
// ————————————————————————————————————————————————————————————————————

global.mess = {
    wait:     '¡Espera un momento, por favor! Estoy haciendo lo posible... 🍀',
    success:  '¡Listo! Lo hice con mucho esfuerzo 🍀✨',
    error:    'Oh no... algo salió mal. Pero no me rindo 💪🍀',
    owner:    'Este comando es solo para mis dueños, lo siento mucho... 🙏',
    group:    '¡Este comando solo funciona en grupos! 🍀',
    admin:    'Solo los administradores pueden usar esto, discúlpame 🙇',
    botAdmin: 'Necesito ser administradora para hacer eso... ¿Me podrías dar admin? 🥺',
    restrict: 'Esta función está bloqueada por ahora 🔒',
    notReg:   '¡Primero debes registrarte! Usa #reg para hacerlo 📝🍀'
}

// ————————————————————————————————————————————————————————————————————
// AUTO-RELOAD
// ————————————————————————————————————————————————————————————————————

const file = fileURLToPath(import.meta.url)

fs.watchFile(file, async () => {
    try {
        fs.unwatchFile(file)
        console.log(chalk.greenBright('\n🍀 [SETTINGS]: Cambios guardados. Aarom tiene el control.'))
        await import(`${file}?update=${Date.now()}`)
    } catch (e) {
        console.error(chalk.red('[!] Error en auto-reload:'), e)
    }
})

export default global