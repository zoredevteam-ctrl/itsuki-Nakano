import './settings.js'
import chalk from 'chalk'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import readlineSync from 'readline-sync'
import { fileURLToPath } from 'url'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason
} from '@whiskeysockets/baileys'
import { handler } from './handler.js'
import { database } from './lib/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, 'plugins')
global.conns = []

// ─── LOGGER ───────────────────────────────────────────────────────────────────
const log = {
  info:    msg => console.log(chalk.bgGreen.white.bold('  INFO  ')   + ' ' + chalk.white(msg)),
  success: msg => console.log(chalk.bgAnsi256(40).white.bold(' SUCCESS') + ' ' + chalk.greenBright(msg)),
  warn:    msg => console.log(chalk.bgYellow.black.bold('  WARN  ')  + ' ' + chalk.yellow(msg)),
  error:   msg => console.log(chalk.bgRed.white.bold('  ERROR ')    + ' ' + chalk.redBright(msg))
}

const g1 = chalk.hex('#7CFC00')
const g2 = chalk.hex('#ADFF2F')
const g3 = chalk.hex('#228B22')

// ─── BANNER ───────────────────────────────────────────────────────────────────
const itsukiBanner = `
${g3('╔══════════════════════════════════════════════╗')}
${g3('║')}  ${g1('██╗████████╗███████╗██╗   ██╗██╗  ██╗██╗')}     ${g3('║')}
${g3('║')}  ${g1('██║╚══██╔══╝██╔════╝██║   ██║██║ ██╔╝██║')}     ${g3('║')}
${g3('║')}  ${g1('██║   ██║   ███████╗██║   ██║█████╔╝ ██║')}     ${g3('║')}
${g3('║')}  ${g1('██║   ██║   ╚════██║██║   ██║██╔═██╗ ██║')}     ${g3('║')}
${g3('║')}  ${g1('██║   ██║   ███████║╚██████╔╝██║  ██╗██║')}     ${g3('║')}
${g3('║')}  ${g1('╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝')}    ${g3('║')}
${g3('║')}                                              ${g3('║')}
${g3('║')}  ${g2('✦  N A K A N O  B O T  S Y S T E M S  ✦')}      ${g3('║')}
${g3('║')}  ${chalk.white.bold('    Powered by  𝓐𝓪𝓻𝓸𝓶  |  Z0RT SYSTEMS   ')}   ${g3('║')}
${g3('║')}  ${chalk.gray('  Version: ' + (global.botVersion || '1.0.0') + ' | Baileys 7.0.0-rc.9     ')}   ${g3('║')}
${g3('╚══════════════════════════════════════════════╝')}
`

// ─── CARGA DE PLUGINS ─────────────────────────────────────────────────────────
const plugins = new Map()

async function loadPlugins() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  for (const file of files) {
    try {
      const filePath = path.resolve(pluginsDir, file)
      const plugin   = (await import(`file://${filePath}?t=${Date.now()}`)).default
      if (plugin) {
        plugins.set(file, plugin)
        log.success(`Cargado: ${file}`)
      }
    } catch (e) {
      log.error(`Error en ${file}: ${e.message}`)
    }
  }
}

// ─── SESIÓN ───────────────────────────────────────────────────────────────────
global.sessionName = './Sessions/Owner'
if (!fs.existsSync(global.sessionName)) fs.mkdirSync(global.sessionName, { recursive: true })

const methodCodeQR = process.argv.includes('--qr')
const methodCode   = process.argv.includes('--code')

let opcion      = ''
let phoneNumber = ''

// ─── BOT ──────────────────────────────────────────────────────────────────────
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version }          = await fetchLatestBaileysVersion()

  if (!methodCodeQR && !methodCode && !state.creds.registered && !opcion) {
    console.clear()
    console.log(itsukiBanner)
    console.log(chalk.bold.green('🍀 SELECCIONA TU MÉTODO DE VINCULACIÓN:\n'))
    console.log(chalk.greenBright('   [1]') + chalk.white(' Código QR'))
    console.log(chalk.greenBright('   [2]') + chalk.white(' Código de 8 dígitos'))
    opcion = readlineSync.question(chalk.bold.yellow('\n--> Elige una opción (1 o 2): ')).trim()

    if (opcion === '2') {
      phoneNumber = readlineSync
        .question(chalk.greenBright('\n🍀 Ingresa tu número (ej: 57310...): '))
        .replace(/\D/g, '')
    }
  }

  const conn = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    markOnlineOnConnect:            true,
    generateHighQualityLinkPreview: true,
    getMessage: async () => ({ conversation: 'Itsuki Nakano está aquí.' })
  })

  global.conn = conn

  conn.decodeJid = jid => {
    if (!jid) return jid
    const decode = jidDecode(jid) || {}
    return (decode.user && decode.server) ? `${decode.user}@${decode.server}` : jid
  }

  conn.ev.on('creds.update', saveCreds)

  if ((opcion === '2' || methodCode) && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code      = await conn.requestPairingCode(phoneNumber)
        const formatted = code?.match(/.{1,4}/g)?.join('-') || code
        console.log(
          chalk.bgGreen.white.bold('\n 🍀 TU CÓDIGO: ') +
          chalk.bgBlack.white.bold(` ${formatted} `) +
          '\n'
        )
      } catch (e) {
        log.error(`No se pudo obtener el código: ${e.message}`)
      }
    }, 3000)
  }

  // ─── EVENTOS DE CONEXIÓN ──────────────────────────────────────────────────
  conn.ev.on('connection.update', async update => {
    const { qr, connection, lastDisconnect } = update

    if (qr && (opcion === '1' || methodCodeQR)) {
      console.log(chalk.green('\nEscanea este código QR con tu WhatsApp:'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      log.success(`Online: ${conn.user?.name || 'Itsuki Bot'} ✓`)
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason     = lastDisconnect?.error?.message || 'Desconocido'

      if (statusCode !== DisconnectReason.loggedOut) {
        log.warn(`Reconectando... (razón: ${reason})`)
        startBot()
      } else {
        log.error('Sesión cerrada. Borra la carpeta Sessions para re-vincular.')
      }
    }
  })

  // ─── BIENVENIDA / DESPEDIDA ───────────────────────────────────────────────
  conn.ev.on('group-participants.update', async (anu) => {
    try {
      for (const [, plugin] of plugins) {
        if (typeof plugin?.participantsUpdate === 'function') {
          try {
            await plugin.participantsUpdate(conn, anu, database.data)
          } catch (e) {
            console.error('[PARTICIPANTS PLUGIN ERROR]', e.message)
          }
        }
      }
    } catch (err) {
      log.error(`group-participants.update: ${err.message}`)
    }
  })

  // ─── MENSAJES ─────────────────────────────────────────────────────────────
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const m = messages[0]
    if (!m?.message || m.key.remoteJid === 'status@broadcast') return
    try {
      await handler(m, conn, plugins)
    } catch (e) {
      log.error(`handler: ${e.message}`)
    }
  })
}

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────
;(async () => {
  await database.read()

  if (database.data?.settings?.prefix) global.prefix = database.data.settings.prefix
  if (database.data?.settings?.banner) global.banner = database.data.settings.banner

  await loadPlugins()
  global.plugins = plugins
  await startBot()
})()
