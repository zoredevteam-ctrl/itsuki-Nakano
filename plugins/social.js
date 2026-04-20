/**
 * COMANDOS SOCIALES - ITSUKI NAKANO
 * casar, divorcio, adoptar, duelo, perfil — con humor según hora 🍀
 */

import { database } from '../lib/database.js'
import { getMood, moodEmoji } from './itsuki_mood.js'

const COSTO_BODA    = 50
const APUESTA_DUELO = 20
const DUELO_TIMEOUT = 30000

const pendingBodas  = new Map()
const pendingDuelos = new Map()

const getBanner = async () => { try { const s=global.banner||''; if(!s)return null; if(s.startsWith('data:image'))return Buffer.from(s.split(',')[1],'base64'); const r=await fetch(s); return Buffer.from(await r.arrayBuffer()) } catch{return null} }

const sendItsuki = async (conn,chat,text,quoted=null) => conn.sendMessage(chat,{
    text, contextInfo:{ externalAdReply:{ title:`💕 ${global.botName||'Itsuki Nakano'}`, body:'Social '+moodEmoji[getMood()], thumbnail:getBanner(), sourceUrl:global.rcanal||'', mediaType:1, renderLargerThumbnail:false } }
},quoted?{quoted}:{})

const normJid = jid => (jid||'').split('@')[0].split(':')[0]+'@s.whatsapp.net'
const say     = (mood,msgs) => msgs[mood]||msgs['manana']

let handler = async (m, { conn, command, text, args, isGroup, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normJid(m.sender)
    const user   = database.getUser(sender)
    const mood   = getMood()
    const e      = moodEmoji[mood]
    if (!db.users) db.users={}

    if (cmd==='casar'||cmd==='proponer'||cmd==='marry') {
        if (!isGroup) return sendItsuki(conn,m.chat,`${e} Las bodas son en grupos~ 💕🍀`,m)
        const target = m.mentionedJid?.[0]?normJid(m.mentionedJid[0]):m.quoted?.sender?normJid(m.quoted.sender):null
        if (!target) return sendItsuki(conn,m.chat,say(mood,{
            manana:`📚 *MATRIMONIO*\n\nMenciona a quien quieres proponer~ 🍀\nCosto: *${COSTO_BODA} 💰*`,
            tarde:`🍱 *MATRIMONIO*\n\nMenciona a quien proponer~ 💕\nCosto: *${COSTO_BODA} 💰*\n_(Oye, ¿y si después comemos algo?)_ 😅`,
            noche:`😴 *MATRIMONIO*\n\nMenciona a quien proponer~ a esta hora tan romántica 🌙\nCosto: *${COSTO_BODA} 💰*`,
            madrugada:`😤 *MATRIMONIO*\n\nA las ${new Date().getHours()}am proponiendo matrimonio... Menciona a quien. Costo *${COSTO_BODA} 💰*`
        }),m)
        if (target===sender) return sendItsuki(conn,m.chat,`${e} No puedes casarte contigo mismo/a~ 😅🍀`,m)
        if (user.casadoCon) return sendItsuki(conn,m.chat,`${e} Ya estás casado/a con @${user.casadoCon.split('@')[0]}~\nUsa *#divorcio* primero 🍀`,m)
        if ((user.limit||user.money||0)<COSTO_BODA) return sendItsuki(conn,m.chat,`${e} No tienes suficientes coins~ *${COSTO_BODA} 💰* necesarios\nTienes: *${user.limit||user.money||0} 💰* 🍀`,m)
        const key=`${m.chat}:${target}`
        if (pendingBodas.has(key)) return sendItsuki(conn,m.chat,`${e} Ya hay propuesta pendiente~ 🍀`,m)
        const timeout=setTimeout(()=>{ pendingBodas.delete(key); conn.sendMessage(m.chat,{ text:say(mood,{ manana:`📚 La propuesta de @${sender.split('@')[0]} expiró sin respuesta~ 🍀`, tarde:`🍱 Propuesta expirada... igual que mi almuerzo de ayer 😔🍀`, noche:`😴 Propuesta expirada... buenas noches~ 🌙🍀`, madrugada:`😤 Propuesta expirada. 🍀` }), contextInfo:{mentionedJid:[sender]} }) },DUELO_TIMEOUT)
        pendingBodas.set(key,{from:sender,timeout})
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *¡PROPUESTA DE MATRIMONIO!* 💕\n\n@${sender.split('@')[0]} propone a @${target.split('@')[0]}~ 🍀\n💰 *Costo:* ${COSTO_BODA}\n\n@${target.split('@')[0]}, responde *#aceptar* en 30s~ 🌸`,
                tarde:`🍱 *¡PROPUESTA!* 💕\n\n@${sender.split('@')[0]} propone a @${target.split('@')[0]}~ 🍀\n_(¿Habrá torta de boda? Tengo hambre...)_ 😅\n💰 ${COSTO_BODA} | *#aceptar* en 30s`,
                noche:`😴 *¡PROPUESTA DE BODA!* 💕\n\n@${sender.split('@')[0]} → @${target.split('@')[0]} 🌙🍀\n💰 ${COSTO_BODA} | *#aceptar* en 30s`,
                madrugada:`😤 *PROPUESTA* — @${sender.split('@')[0]} → @${target.split('@')[0]}\n💰 ${COSTO_BODA} | *#aceptar* en 30s. A las ${new Date().getHours()}am.`
            }),
            contextInfo:{mentionedJid:[sender,target]}
        },{ quoted:m })
    }

    if (cmd==='aceptar') {
        if (!isGroup) return
        const key=`${m.chat}:${sender}`; const propuesta=pendingBodas.get(key)
        if (!propuesta) return sendItsuki(conn,m.chat,`${e} No tienes propuesta pendiente~ 🍀`,m)
        clearTimeout(propuesta.timeout); pendingBodas.delete(key)
        const from=propuesta.from; const fromUser=database.getUser(from)
        fromUser.limit=(fromUser.limit||fromUser.money||0)-COSTO_BODA
        fromUser.casadoCon=sender; user.casadoCon=from
        fromUser.fechaBoda=Date.now(); user.fechaBoda=Date.now()
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *¡SE CASARON!* 🎉\n\n@${from.split('@')[0]} 💕 @${sender.split('@')[0]}\n¡Que sean muy felices y muy estudiosos! 🍀✨`,
                tarde:`🍱 *¡SE CASARON!* 🎉\n\n@${from.split('@')[0]} 💕 @${sender.split('@')[0]}\n¡Felicidades! ¿Habrá banquete? 😋🍀`,
                noche:`😴 *¡SE CASARON!* 🎉\n\n@${from.split('@')[0]} 💕 @${sender.split('@')[0]}\n¡Qué romántico a esta hora~ 🌙🍀`,
                madrugada:`😤 *SE CASARON* — @${from.split('@')[0]} 💕 @${sender.split('@')[0]}\nFelicidades. Son las ${new Date().getHours()}am. 🍀`
            }),
            contextInfo:{mentionedJid:[from,sender]}
        })
    }

    if (cmd==='divorcio'||cmd==='divorce') {
        if (!user.casadoCon) return sendItsuki(conn,m.chat,`${e} No estás casado/a~ 🍀`,m)
        const ex=user.casadoCon; const exUser=database.getUser(ex)
        user.casadoCon=null; user.fechaBoda=null
        if (exUser.casadoCon===sender){ exUser.casadoCon=null; exUser.fechaBoda=null }
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *DIVORCIO*\n\n@${sender.split('@')[0]} y @${ex.split('@')[0]} se separaron.\nEspero que ambos sigan estudiando mucho~ 🍀`,
                tarde:`🍱 *DIVORCIO*\n\n@${sender.split('@')[0]} y @${ex.split('@')[0]}...\nAl menos que coman bien~ 😔🍀`,
                noche:`😴 *DIVORCIO*\n\nSe separaron... buenas noches a ambos~ 🌙🍀`,
                madrugada:`😤 *DIVORCIO* — @${sender.split('@')[0]} y @${ex.split('@')[0]}. Hecho. 🍀`
            }),
            contextInfo:{mentionedJid:[sender,ex]}
        },{ quoted:m })
    }

    if (cmd==='adoptar'||cmd==='adopt') {
        if (!isGroup) return sendItsuki(conn,m.chat,`${e} Solo en grupos~ 🍀`,m)
        const target=m.mentionedJid?.[0]?normJid(m.mentionedJid[0]):m.quoted?.sender?normJid(m.quoted.sender):null
        if (!target) return sendItsuki(conn,m.chat,`${e} Menciona a quien quieres adoptar~ 🍀`,m)
        if (target===sender) return sendItsuki(conn,m.chat,`${e} No puedes adoptarte a ti mismo/a~ 😅`,m)
        const tUser=database.getUser(target)
        if (tUser.padre||tUser.madre) return sendItsuki(conn,m.chat,`${e} @${target.split('@')[0]} ya tiene familia~ 🍀`,m)
        if (!user.hijos) user.hijos=[]
        user.hijos.push(target); tUser.padre=sender
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *¡ADOPCIÓN EXITOSA!* 🎉\n\n@${sender.split('@')[0]} adoptó a @${target.split('@')[0]}~ 💕\n¡A estudiar juntos! 🍀`,
                tarde:`🍱 *¡ADOPCIÓN!* 🎉\n\n@${sender.split('@')[0]} adoptó a @${target.split('@')[0]}~ 💕\n¡Y ahora a comer juntos! 😋🍀`,
                noche:`😴 *¡ADOPCIÓN!* 🎉\n\n@${sender.split('@')[0]} adoptó a @${target.split('@')[0]}~ 💕\nBuenas noches familia~ 🌙🍀`,
                madrugada:`😤 *ADOPCIÓN* — @${sender.split('@')[0]} → @${target.split('@')[0]}. 🍀`
            }),
            contextInfo:{mentionedJid:[sender,target]}
        },{ quoted:m })
    }

    if (cmd==='duelo'||cmd==='duel') {
        if (!isGroup) return sendItsuki(conn,m.chat,`${e} Los duelos en grupos~ ⚔️🍀`,m)
        const target=m.mentionedJid?.[0]?normJid(m.mentionedJid[0]):m.quoted?.sender?normJid(m.quoted.sender):null
        if (!target) return sendItsuki(conn,m.chat,`${e} Menciona a quien retar~\nApuesta: *${APUESTA_DUELO} 💰* | *#aceptarduelo* en 30s 🍀`,m)
        if (target===sender) return sendItsuki(conn,m.chat,`${e} No puedes retarte a ti mismo/a~ 😅`,m)
        if ((user.limit||user.money||0)<APUESTA_DUELO) return sendItsuki(conn,m.chat,`${e} No tienes suficientes coins~ *${APUESTA_DUELO} 💰* necesarios 🍀`,m)
        const key=`${m.chat}:${target}`
        if (pendingDuelos.has(key)) return sendItsuki(conn,m.chat,`${e} Ya hay duelo pendiente~ 🍀`,m)
        const timeout=setTimeout(()=>{ pendingDuelos.delete(key); conn.sendMessage(m.chat,{ text:`${e} El reto de @${sender.split('@')[0]} expiró~ 🍀`, contextInfo:{mentionedJid:[sender]} }) },DUELO_TIMEOUT)
        pendingDuelos.set(key,{from:sender,apuesta:APUESTA_DUELO,timeout})
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *¡RETO DE DUELO!* ⚔️\n\n@${sender.split('@')[0]} reta a @${target.split('@')[0]}~ 🍀\n💰 *Apuesta:* ${APUESTA_DUELO}\n\n@${target.split('@')[0]}, responde *#aceptarduelo* en 30s~`,
                tarde:`🍱 *¡DUELO!* ⚔️\n\n@${sender.split('@')[0]} vs @${target.split('@')[0]}~ 💰 ${APUESTA_DUELO}\n_(¿Apostamos comida también?)_ 😅\n*#aceptarduelo* en 30s`,
                noche:`😴 *¡DUELO NOCTURNO!* ⚔️\n\n@${sender.split('@')[0]} vs @${target.split('@')[0]}~ 🌙\n💰 ${APUESTA_DUELO} | *#aceptarduelo* en 30s`,
                madrugada:`😤 *DUELO* — @${sender.split('@')[0]} vs @${target.split('@')[0]}\n💰 ${APUESTA_DUELO} | *#aceptarduelo* en 30s. A las ${new Date().getHours()}am.`
            }),
            contextInfo:{mentionedJid:[sender,target]}
        },{ quoted:m })
    }

    if (cmd==='aceptarduelo') {
        if (!isGroup) return
        const key=`${m.chat}:${sender}`; const duelo=pendingDuelos.get(key)
        if (!duelo) return sendItsuki(conn,m.chat,`${e} No tienes reto pendiente~ 🍀`,m)
        const tUser=database.getUser(sender)
        if ((tUser.limit||tUser.money||0)<duelo.apuesta){ clearTimeout(duelo.timeout); pendingDuelos.delete(key); return sendItsuki(conn,m.chat,`${e} No tienes suficientes coins~ 🍀`,m) }
        clearTimeout(duelo.timeout); pendingDuelos.delete(key)
        const from=duelo.from; const fromUser=database.getUser(from)
        const ganador=Math.random()<0.5?from:sender; const perdedor=ganador===from?sender:from
        const gUser=database.getUser(ganador); const pUser=database.getUser(perdedor)
        const campo = u => u.limit!==undefined?'limit':'money'
        gUser[campo(gUser)]=(gUser[campo(gUser)]||0)+duelo.apuesta
        pUser[campo(pUser)]=Math.max(0,(pUser[campo(pUser)]||0)-duelo.apuesta)
        const ataques=['usó un jutsu de fuego épico 🔥','repasó el cuaderno y ganó 📚','tuvo más stamina después del almuerzo 🍱','no tenía sueño y peleó mejor 💪','encontró el error en el examen final ✏️']
        const ataque=ataques[Math.floor(Math.random()*ataques.length)]
        return conn.sendMessage(m.chat,{
            text:say(getMood(),{
                manana:`📚 *¡FIN DEL DUELO!* 🏆\n\n@${ganador.split('@')[0]} ${ataque} y venció~\n\n🏆 *Ganador:* @${ganador.split('@')[0]} +${duelo.apuesta} 💰\n💔 *Perdedor:* @${perdedor.split('@')[0]} -${duelo.apuesta} 💰\n\n_¡Mejor estudia para la próxima!_ 📚🍀`,
                tarde:`🍱 *¡FIN DEL DUELO!* 🏆\n\n@${ganador.split('@')[0]} ganó~ probablemente porque comió mejor hoy 😅\n\n🏆 @${ganador.split('@')[0]} +${duelo.apuesta} 💰 | 💔 @${perdedor.split('@')[0]} -${duelo.apuesta} 💰 🍀`,
                noche:`😴 *¡FIN!* 🏆\n\n@${ganador.split('@')[0]} ganó~ el sueño da fuerza 🌙\n\n🏆 +${duelo.apuesta} 💰 | 💔 -${duelo.apuesta} 💰 🍀`,
                madrugada:`😤 *DUELO TERMINADO* — @${ganador.split('@')[0]} ganó. @${perdedor.split('@')[0]} perdió. ${duelo.apuesta} coins. 🍀`
            }),
            contextInfo:{mentionedJid:[ganador,perdedor]}
        })
    }

    if (cmd==='perfil'||cmd==='profile') {
        const target=m.mentionedJid?.[0]?normJid(m.mentionedJid[0]):m.quoted?.sender?normJid(m.quoted.sender):sender
        const tUser=database.getUser(target)
        const nombre=target===sender?(m.pushName||'Tú'):`@${target.split('@')[0]}`
        return conn.sendMessage(m.chat,{
            text:say(mood,{
                manana:`📚 *PERFIL SOCIAL*\n\n*${nombre}*\n\n${tUser.casadoCon?`💍 Con @${tUser.casadoCon.split('@')[0]}`:'💔 Soltero/a'}\n${tUser.hijos?.length?`👶 Hijos: ${tUser.hijos.length}`:'👶 Sin hijos'}\n${tUser.padre?`👨 Padre/Madre: @${tUser.padre.split('@')[0]}\n`:''}\n💰 *Coins:* ${tUser.limit||tUser.money||0}\n✨ *Exp:* ${tUser.exp||0}\n⭐ *Nivel:* ${tUser.level||1} 🍀`,
                tarde:`🍱 *PERFIL* — *${nombre}*\n\n${tUser.casadoCon?`💍 @${tUser.casadoCon.split('@')[0]}`:'💔 Soltero/a'}\n💰 ${tUser.limit||tUser.money||0} | ✨ ${tUser.exp||0} | ⭐ ${tUser.level||1} 🍀`,
                noche:`😴 *PERFIL* — *${nombre}*\n\n${tUser.casadoCon?`💍 @${tUser.casadoCon.split('@')[0]}`:'💔 Soltero/a'}\n💰 ${tUser.limit||tUser.money||0} | ✨ ${tUser.exp||0} | ⭐ ${tUser.level||1}\n_Buenas noches~ 🌙🍀_`,
                madrugada:`😤 *PERFIL* — *${nombre}*\n${tUser.casadoCon?`💍 @${tUser.casadoCon.split('@')[0]}`:'💔 Soltero/a'}\n💰 ${tUser.limit||tUser.money||0} ⭐ ${tUser.level||1} 🍀`
            }),
            contextInfo: target!==sender?{mentionedJid:[target]}:{}
        },{ quoted:m })
    }
}

handler.command = ['casar','proponer','marry','aceptar','divorcio','divorce','adoptar','adopt','duelo','duel','aceptarduelo','perfil','profile']
export default handler