/**
 * REPORT - ITSUKI NAKANO
 */

import { database } from '../lib/database.js'
import { getMood, moodEmoji } from './itsuki_mood.js'

const COOLDOWN = 5*60*1000
const getBanner = async () => { try { const s=global.banner||''; if(!s)return null; if(s.startsWith('data:image'))return Buffer.from(s.split(',')[1],'base64'); const r=await fetch(s); return Buffer.from(await r.arrayBuffer()) } catch{return null} }

const say = (mood, msgs) => msgs[mood]||msgs['manana']

let handler = async (m, { conn, text, isOwner }) => {
    const sender   = (m.sender||'').split('@')[0].split(':')[0]+'@s.whatsapp.net'
    const user     = database.getUser(sender)
    const ahora    = Date.now()
    const mood     = getMood()
    const e        = moodEmoji[mood]

    if (!text?.trim()) {
        return conn.sendMessage(m.chat, {
            text: say(mood,{
                manana:`馃摎 *REPORTAR PROBLEMA*\n\nPuedes reportarle cualquier error a Aarom directamente~ 馃崁\n\n*Uso:* *#report <descripci贸n>*\n*Ejemplo:* #report El comando #play no funciona 馃崁`,
                tarde:`馃嵄 *REPORTAR PROBLEMA*\n\nDile a Aarom qu茅 pas贸~ 馃崁\n\n*Uso:* *#report <descripci贸n>*`,
                noche:`馃槾 *REPORTAR PROBLEMA*\n\nSi algo fall贸, rep贸rtalo~ aunque sea tarde 馃寵馃崁\n\n*Uso:* *#report <descripci贸n>*`,
                madrugada:`馃槫 *REPORTAR PROBLEMA*\n\n驴A esta hora? Bueno... escribe *#report <descripci贸n>* 馃崁`
            }),
            contextInfo:{ externalAdReply:{ title:`馃摙 ${global.botName||'Itsuki Nakano'}`, body:'Reportes '+e, thumbnail:await getBanner(), sourceUrl:global.rcanal||'', mediaType:1, renderLargerThumbnail:false } }
        },{ quoted:m })
    }

    const lastReport  = user.lastReport||0
    const espera      = COOLDOWN-(ahora-lastReport)
    if (espera>0&&!isOwner) {
        const min=Math.ceil(espera/60000)
        return m.reply(say(mood,{
            manana:`馃摎 Ya enviaste un reporte hace poco~ Espera *${min} minuto${min!==1?'s':''}* m谩s 馃崁`,
            tarde:`馃嵄 Espera *${min} min* m谩s... igual que esperar el almuerzo 馃槄`,
            noche:`馃槾 *${min} min* m谩s... yo tambi茅n espero el sue帽o~ 馃寵`,
            madrugada:`馃槫 *${min} min*. Esto a las ${new Date().getHours()}am.`
        }))
    }
    user.lastReport = ahora

    const owners    = Array.isArray(global.owner)?global.owner:[]
    const root      = owners.find(o=>Array.isArray(o)&&o[2]===true)
    if (!root) return m.reply(`${e} No pude encontrar al owner~ 馃ズ`)
    const rootJid   = root[0].replace(/[^0-9]/g,'')+' @s.whatsapp.net'
    const fecha     = new Date().toLocaleString('es-CO',{timeZone:'America/Bogota'})

    try {
        await conn.sendMessage(rootJid.replace(' ',''), {
            text:
                `馃摙 *NUEVO REPORTE 鈥� ITSUKI BOT*\n\n` +
                `馃懁 *Usuario:* ${m.pushName||'Desconocido'}\n` +
                `馃摫 *N煤mero:* +${sender.split('@')[0]}\n` +
                `${m.isGroup?`馃懃 *Grupo:* ${m.chat}`:'馃挰 *Privado*'}\n` +
                `馃晲 *Fecha:* ${fecha}\n\n` +
                `馃摑 *Descripci贸n:*\n${text.trim()}\n\n` +
                `> _Reporte desde ${global.botName||'Itsuki Nakano'} 馃崁_`,
            contextInfo:{ externalAdReply:{ title:`馃摙 Reporte de ${m.pushName||'Usuario'}`, body:text.trim().slice(0,60), thumbnail:await getBanner(), sourceUrl:global.rcanal||'', mediaType:1, renderLargerThumbnail:false } }
        })
        return conn.sendMessage(m.chat, {
            text: say(mood,{
                manana:`馃摎 *隆REPORTE ENVIADO!* 鉁匼n\nAarom lo revisar谩~ 隆Gracias por ayudar a mejorar! 馃崁\n\n馃摑 _${text.trim()}_`,
                tarde:`馃嵄 *隆REPORTE ENVIADO!* 鉁匼n\nAarom lo ver谩 despu茅s del almuerzo 馃槄馃崁\n\n馃摑 _${text.trim()}_`,
                noche:`馃槾 *隆REPORTE ENVIADO!* 鉁匼n\nAarom lo ver谩 ma帽ana~ descansa 馃寵馃崁\n\n馃摑 _${text.trim()}_`,
                madrugada:`馃槫 *REPORTE ENVIADO* 鉁匼n\nEnviado. A las ${new Date().getHours()}am. 馃崁\n\n馃摑 _${text.trim()}_`
            }),
            contextInfo:{ externalAdReply:{ title:`鉁� Reporte enviado`, body:`${global.botName||'Itsuki'}`, thumbnail:await getBanner(), sourceUrl:global.rcanal||'', mediaType:1, renderLargerThumbnail:false } }
        },{ quoted:m })
    } catch(e2) {
        return m.reply(`${e} No pude enviar el reporte~ 馃ズ Error: ${e2.message}`)
    }
}

handler.command = ['report','reportar','bug']
export default handler