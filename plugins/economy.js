/**
 * ECONOMY - ITSUKI NAKANO
 * Sistema completo de economía con comandos troll
 * Cooldowns: daily/cofre 24h | work/minar/crime/rob/pesca/mendigo/casino 1min
 * Z0RT SYSTEMS 🌸
 */

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const toMs     = (h=0,m=0,s=0) => ((h*3600)+(m*60)+s)*1000
const formatNum = (n) => {
    try {
        const v = parseInt(n)||0
        if(v>=1_000_000) return (v/1_000_000).toFixed(1)+'M'
        if(v>=1_000)     return (v/1_000).toFixed(1)+'k'
        return v.toLocaleString()
    } catch { return String(n||0) }
}
const formatDelta = (ms) => {
    if(!ms||ms<=0) return '0s'
    const t=Math.floor(ms/1000)
    const h=Math.floor(t/3600), m=Math.floor((t%3600)/60), s=t%60
    const p=[]
    if(h)p.push(`${h}h`); if(m)p.push(`${m}m`); p.push(`${s}s`)
    return p.join(' : ')
}
const ensureUser = (db, jid) => {
    if(!db.users)      db.users={}
    if(!db.users[jid]) db.users[jid]={}
    const d={money:0,bank:0,exp:0,level:1,wins:0,
             lastDaily:0,lastCofre:0,lastWork:0,lastMinar:0,
             lastCrime:0,lastRob:0,lastPesca:0,lastMendigo:0,lastCasino:0}
    for(const[k,v]of Object.entries(d))
        if(db.users[jid][k]===undefined) db.users[jid][k]=v
    return db.users[jid]
}

const sendEco = async (conn, m, text, mentions=[]) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        `💰 ${global.botName||'Itsuki Nakano'}`,
        'Sistema de Economía 🌸'
    )
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const CD24 = toMs(24,0,0)
const CD1M = toMs(0,1,0)

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, command, text, args, isOwner, db }) => {
    const cmd      = command.toLowerCase()
    const sender   = (m.sender||'').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/,'').split('@')[0]+('@s.whatsapp.net')
    const u        = ensureUser(db, sender)
    const username = m.pushName || 'Usuario'
    const now      = Date.now()
    const currency = 'Flores'
    const prefix   = global.prefix || '#'

    const onCooldown = (key, tiempo, nombre) => {
        const diff = now - (u[key]||0)
        if(diff < tiempo){
            sendEco(conn, m,
                `⏳ *¡Espera un poco!*\n\n` +
                `Aún no puedes usar *${nombre}*.\n` +
                `> ✰ Faltan: *${formatDelta(tiempo-diff)}*\n\n` +
                `_La paciencia es una virtud~ 🌸_`
            )
            return true
        }
        return false
    }

    // ── DAILY ─────────────────────────────────────────────────────────────────
    if(cmd==='daily'||cmd==='diario'){
        if(onCooldown('lastDaily',CD24,'daily')) return
        const amount=randInt(200,800)
        u.money+=amount; u.lastDaily=now
        const msgs=[
            `🌸 *¡RECOMPENSA DIARIA!*\n\nItsuki te entrega *${amount} ${currency}* con una sonrisa.\n_"Aquí tienes, no los gastes todos de golpe"_ 🌷`,
            `💐 *¡DAILY RECLAMADO!*\n\nHoy el universo te sonríe~ Ganaste *${amount} ${currency}*\n_¡Vuelve mañana para más!_ ✨`,
            `🌺 *¡FLORES DEL DÍA!*\n\nItsuki dejó *${amount} ${currency}* en tu puerta esta mañana.\n_"Que tengas un lindo día"_ 🌸`
        ]
        return sendEco(conn,m,msgs[randInt(0,2)])
    }

    // ── COFRE ─────────────────────────────────────────────────────────────────
    if(cmd==='cofre'||cmd==='chest'){
        if(onCooldown('lastCofre',CD24,'cofre')) return
        const amount=randInt(100,500), exp=randInt(20,60)
        u.money+=amount; u.exp+=exp; u.lastCofre=now
        return sendEco(conn,m,
            `📦 *¡COFRE ABIERTO!*\n\n` +
            `Encontraste un cofre misterioso~ Dentro había:\n` +
            `💰 *${amount} ${currency}*\n✨ *${exp} Exp*\n\n` +
            `_¡Vuelve mañana a buscar más!_ 🌸`
        )
    }

    // ── WORK / CHAMBA ─────────────────────────────────────────────────────────
    if(cmd==='work'||cmd==='trabajar'||cmd==='chamba'){
        if(onCooldown('lastWork',CD1M,'work')) return
        const troll  = cmd==='chamba'
        const amount = troll ? randInt(5,20) : randInt(100,300)
        const exp    = randInt(10,40)
        u.money+=amount; u.exp+=exp; u.lastWork=now
        const trollMsgs=[
            `😂 *¡CHAMBA COMPLETADA!*\n\nEstuviste 8 horas cargando ladrillos...\nEl patrón te pagó *${amount} ${currency}* y ni las gracias dio 😤\n_Eso es vida, ${username}_ 💀`,
            `🤣 *¡SALARIO MÍNIMO!*\n\nVendiste chicles en el semáforo todo el día.\nGanaste *${amount} ${currency}* y una quemada de sol gratis 🌞\n_Al menos algo es algo_ 💀`,
            `😭 *¡DÍA DURO!*\n\nTu jefe te mandó a limpiar baños por 6 horas.\nPago: *${amount} ${currency}* y un "gracias" seco 😒`
        ]
        const workMsgs=[
            `💼 *¡TRABAJO COMPLETADO!*\n\nFuiste productivo hoy~ Ganaste *${amount} ${currency}* 💪`,
            `👔 *¡JORNADA EXITOSA!*\n\nTu jefe quedó impresionado.\nRecibiste *${amount} ${currency}* 💰`,
            `🏆 *¡EMPLEADO DEL MES!*\n\nTrabajaste increíble hoy.\nGanaste *${amount} ${currency}* 🎉`
        ]
        const list=troll?trollMsgs:workMsgs
        return sendEco(conn,m,list[randInt(0,list.length-1)])
    }

    // ── MINAR ─────────────────────────────────────────────────────────────────
    if(cmd==='minar'||cmd==='mine'){
        if(onCooldown('lastMinar',CD1M,'minar')) return
        const amount=randInt(50,150), exp=randInt(20,70)
        u.money+=amount; u.exp+=exp; u.lastMinar=now
        const msgs=[
            `⛏️ *¡VETA DE ORO!*\n\nEscavaste profundo y encontraste:\n💰 *+${amount} ${currency}*\n✨ *+${exp} Exp*\n\n_¡Sigue minando!_ 🌸`,
            `💎 *¡PIEDRAS PRECIOSAS!*\n\nTu pico brilló con fuerza:\n💰 *+${amount} ${currency}*\n✨ *+${exp} Exp*\n\n_Itsuki está orgullosa~ 🌷_`,
            `🪨 *¡ROCA ROTA!*\n\nEntre polvo y esfuerzo:\n💰 *+${amount} ${currency}*\n✨ *+${exp} Exp*`
        ]
        return sendEco(conn,m,msgs[randInt(0,2)])
    }

    // ── CRIME (TROLL) ─────────────────────────────────────────────────────────
    if(cmd==='crime'||cmd==='crimen'){
        if(onCooldown('lastCrime',CD1M,'crimen')) return
        u.lastCrime=now
        if(Math.random()<0.3){
            const multa=randInt(20,80)
            u.money=Math.max(0,u.money-multa)
            const f=[
                `🚔 *¡TE ATRAPARON!*\n\nIntentaste robar una panadería pero se te cayó el pasamontañas.\nMulta de *${multa} ${currency}* 💀\n_Itsuki se tapa la cara de vergüenza_ 😭`,
                `🤦 *¡OPERACIÓN FALLIDA!*\n\nOlvidaste conectar el internet para hackear el banco.\nMulta de *${multa} ${currency}* 💀`,
                `😂 *¡QUÉ VERGÜENZA!*\n\nTropezaste intentando robar. Video viral en TikTok.\nMulta de *${multa} ${currency}* 📱💀`
            ]
            return sendEco(conn,m,f[randInt(0,2)])
        }
        const gained=randInt(80,250)
        u.money+=gained
        const msgs=[
            `🦹 *¡CRIMEN EXITOSO!*\n\nRobaste la billetera de un político corrupto.\nObtuviste *${gained} ${currency}* 💀`,
            `🕵️ *¡OPERACIÓN EXITOSA!*\n\nHackeaste la cuenta del banco (el pequeño).\nTransferiste *${gained} ${currency}* 💻`,
            `🎭 *¡GOLPE MAESTRO!*\n\nTe pasaste por el dueño y cobraste la caja.\n*${gained} ${currency}* sin que nadie notara 😈`
        ]
        return sendEco(conn,m,msgs[randInt(0,2)])
    }

    // ── PESCA (TROLL) ─────────────────────────────────────────────────────────
    if(cmd==='pesca'||cmd==='pescar'||cmd==='fish'){
        if(onCooldown('lastPesca',CD1M,'pesca')) return
        u.lastPesca=now
        const r=randInt(1,10)
        if(r<=3){
            const basura=['una chancla vieja 👟','una botella de refresco 🍾','un calcetín mojado 🧦','el celular de alguien 📱','una bolsa de basura 🗑️']
            return sendEco(conn,m,
                `🎣 *¡PESCASTE ALGO!*\n\nDespués de 1 hora esperando...\nPescaste *${basura[randInt(0,basura.length-1)]}*\n\n_El mar te mandó un mensaje, ${username}_ 💀😭`
            )
        } else if(r<=6){
            const amount=randInt(30,100); u.money+=amount
            return sendEco(conn,m,`🐟 *¡PESCA REGULAR!*\n\nPescaste un pez mediano y lo vendiste por *${amount} ${currency}* 🌊\n_No está mal~ 🌸_`)
        } else {
            const amount=randInt(100,300), exp=randInt(10,30); u.money+=amount; u.exp+=exp
            return sendEco(conn,m,`🐠 *¡PESCA ÉPICA!*\n\nPescaste un pez rarísimo!\nGanaste *${amount} ${currency}* + *${exp} Exp*\n\n_Itsuki aplaude tu pesca~ 🌸🎉_`)
        }
    }

    // ── MENDIGO (TROLL puro) ──────────────────────────────────────────────────
    if(cmd==='mendigo'||cmd==='pedir'||cmd==='beg'){
        if(onCooldown('lastMendigo',CD1M,'mendigo')) return
        u.lastMendigo=now
        if(Math.random()<0.5){
            const amount=randInt(1,15); u.money+=amount
            const msgs=[
                `🥺 *¡TE DIERON MONEDAS!*\n\nEstuviste 2 horas en la esquina con un letrero...\nAlguien apiadado te dio *${amount} ${currency}*\n_La dignidad no tiene precio... o sí_ 😂`,
                `🙏 *¡LIMOSNA RECIBIDA!*\n\nUna abuelita pasó y te dio *${amount} ${currency}* con lástima.\n_Ella también la está pasando difícil_ 😭`
            ]
            return sendEco(conn,m,msgs[randInt(0,1)])
        }
        const msgs=[
            `😤 *¡NADIE TE DIO NADA!*\n\nEstuviste horas pidiendo y la gente te ignoró.\nUno te filmó para sus redes. Cero ${currency} 💀`,
            `🚨 *¡TE CORRIERON!*\n\nEl guardia te echó del centro comercial.\nCero ${currency} y quedaste mal parqueado 😂`,
            `😂 *¡ÉPICO FAIL!*\n\nLa gente creyó que era broma.\nAlguien te tiró una galleta. Sin ${currency} para ti 💀`
        ]
        return sendEco(conn,m,msgs[randInt(0,2)])
    }

    // ── ROB ───────────────────────────────────────────────────────────────────
    if(cmd==='rob'||cmd==='robar'){
        if(onCooldown('lastRob',CD1M,'robar')) return
        const target=m.quoted?.sender||m.mentionedJid?.[0]
        if(!target) return sendEco(conn,m,'🎯 Menciona a alguien o responde su mensaje 👀')
        if(target===sender) return sendEco(conn,m,'🤦 No puedes robarte a ti mismo 😂')
        ensureUser(db,target)
        const victim=db.users[target]
        if(!(victim.money||0)) return sendEco(conn,m,
            `😂 @${target.split('@')[0]} está más pelado que tú...\n_¡No tiene nada que robar!_ 💸`,[target])
        u.lastRob=now
        if(Math.random()<0.4){
            const multa=Math.floor((victim.money||0)*0.2)
            u.money=Math.max(0,u.money-multa)
            return sendEco(conn,m,
                `🚔 *¡TE ATRAPARON!*\n\n@${target.split('@')[0]} te vio y llamó a la policía 😤\nMulta de *${multa} ${currency}* 💀\n\n_La próxima sé más sigiloso~ 🌸_`,[target])
        }
        const amount=Math.floor((victim.money||0)*(randInt(20,60)/100))
        victim.money-=amount; u.money+=amount
        return sendEco(conn,m,
            `🥷 *¡ROBO EXITOSO!*\n\n` +
            `Le robaste *${formatNum(amount)} ${currency}* a @${target.split('@')[0]}\n` +
            `¡Ni lo vio venir! 💀\n\n` +
            `_Itsuki desaprueba esto, pero admira la audacia~ 🌸_`,[target])
    }

    // ── SLOTS / CASINO ────────────────────────────────────────────────────────
    if(cmd==='slots'||cmd==='casino'||cmd==='ruleta'){
        if(onCooldown('lastCasino',CD1M,'casino')) return
        const apuesta=parseInt(args[0])||50
        if(apuesta<=0) return sendEco(conn,m,'❌ La apuesta debe ser mayor a 0')
        if((u.money||0)<apuesta) return sendEco(conn,m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatNum(u.money)} ${currency}*`)
        u.lastCasino=now
        const simbolos=['🍒','🍋','🔔','⭐','💎','🌸']
        const s1=simbolos[randInt(0,5)],s2=simbolos[randInt(0,5)],s3=simbolos[randInt(0,5)]
        let res='', gan=0
        if(s1===s2&&s2===s3){
            if(s1==='💎'){gan=apuesta*10;res=`╔══ 💎 JACKPOT 💎 ══╗\n¡TRIPLE DIAMANTE! ×10\nGanaste *${formatNum(gan)} ${currency}*! 🎉`}
            else if(s1==='🌸'){gan=apuesta*7;res=`╔══ 🌸 ITSUKI 🌸 ══╗\n¡TRIPLE FLOR! ×7\nGanaste *${formatNum(gan)} ${currency}*! 🎊`}
            else{gan=apuesta*4;res=`╔══ ${s1}${s1}${s1} ══╗\n¡TRIPLE! ×4\nGanaste *${formatNum(gan)} ${currency}*! 🎉`}
            u.money+=gan; u.wins=(u.wins||0)+1
        } else if(s1===s2||s2===s3||s1===s3){
            gan=Math.floor(apuesta*1.5); u.money+=gan
            res=`╔══ ${s1} ${s2} ${s3} ══╗\n¡PAR! ×1.5\nGanaste *${formatNum(gan)} ${currency}*! 🌸`
        } else {
            u.money-=apuesta
            res=`╔══ ${s1} ${s2} ${s3} ══╗\nSin suerte esta vez...\nPerdiste *${formatNum(apuesta)} ${currency}* 💸`
        }
        return sendEco(conn,m,`🎰 *CASINO ITSUKI*\n\n${res}\n\n💰 Balance: *${formatNum(u.money)} ${currency}*`)
    }

    // ── DEPOSITAR ─────────────────────────────────────────────────────────────
    if(cmd==='depositar'||cmd==='deposit'||cmd==='d'){
        const arg=(args[0]||'').toLowerCase()
        if(!arg) return sendEco(conn,m,`🏦 Usa: *${prefix}d all* o *${prefix}d <cantidad>*`)
        const amount=arg==='all'?(u.money||0):parseInt(arg)
        if(!amount||amount<=0) return sendEco(conn,m,'❌ Cantidad inválida')
        if((u.money||0)<amount) return sendEco(conn,m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatNum(u.money)} ${currency}*`)
        u.money-=amount; u.bank=(u.bank||0)+amount
        return sendEco(conn,m,
            `🏦 *¡DEPÓSITO EXITOSO!*\n\nGuardaste *${formatNum(amount)} ${currency}* en el banco~\n` +
            `💵 En mano: ${formatNum(u.money)}\n🏦 En banco: ${formatNum(u.bank)}\n\n_Itsuki aprueba el ahorro~ 🌸_`)
    }

    // ── RETIRAR ───────────────────────────────────────────────────────────────
    if(cmd==='retirar'||cmd==='withdraw'||cmd==='w'){
        const arg=(args[0]||'').toLowerCase()
        if(!arg) return sendEco(conn,m,`🏦 Usa: *${prefix}w all* o *${prefix}w <cantidad>*`)
        const amount=arg==='all'?(u.bank||0):parseInt(arg)
        if(!amount||amount<=0) return sendEco(conn,m,'❌ Cantidad inválida')
        if((u.bank||0)<amount) return sendEco(conn,m,
            `❌ No tienes suficiente en el banco\n🏦 Tienes: *${formatNum(u.bank)} ${currency}*`)
        u.bank-=amount; u.money=(u.money||0)+amount
        return sendEco(conn,m,
            `🏦 *¡RETIRO EXITOSO!*\n\nRetiraste *${formatNum(amount)} ${currency}* del banco~\n` +
            `💵 En mano: ${formatNum(u.money)}\n🏦 En banco: ${formatNum(u.bank)}\n\n_No te lo gastes todo de una~ 🌸_`)
    }

    // ── BALANCE ───────────────────────────────────────────────────────────────
    if(cmd==='bal'||cmd==='balance'||cmd==='saldo'){
        const target=m.quoted?.sender||m.mentionedJid?.[0]||sender
        ensureUser(db,target)
        const user=db.users[target]
        const total=(user.money||0)+(user.bank||0)
        const esTuyo=target===sender
        return sendEco(conn,m,
            `💰 *${esTuyo?'TU BALANCE':`BALANCE DE @${target.split('@')[0]}`}*\n\n` +
            `💵 En mano: *${formatNum(user.money||0)} ${currency}*\n` +
            `🏦 En banco: *${formatNum(user.bank||0)} ${currency}*\n` +
            `✨ Experiencia: *${formatNum(user.exp||0)} XP*\n` +
            `🏆 Victorias: *${user.wins||0}*\n` +
            `📊 Total: *${formatNum(total)} ${currency}*\n\n` +
            `_${esTuyo?'Itsuki cuida tus flores~ 🌸':'Balance consultado con éxito 🌸'}_`,[target])
    }

    // ── TOP ───────────────────────────────────────────────────────────────────
    if(cmd==='top'||cmd==='ranking'||cmd==='baltop'){
        const all=Object.entries(db.users||{})
            .map(([jid,u])=>({jid,total:(u.money||0)+(u.bank||0)}))
            .filter(u=>u.total>0).sort((a,b)=>b.total-a.total).slice(0,10)
        if(!all.length) return sendEco(conn,m,'📊 Nadie tiene flores aún 🌸')
        const med=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
        let txt=`🏆 *TOP 10 MÁS RICOS* 💰\n\n`
        all.forEach((p,i)=>{ txt+=`${med[i]} @${p.jid.split('@')[0]} → *${formatNum(p.total)} ${currency}*\n` })
        txt+=`\n_¿Tú dónde quedaste?_ 👀`
        return sendEco(conn,m,txt,all.map(p=>p.jid))
    }

    // ── NIVEL ─────────────────────────────────────────────────────────────────
    if(cmd==='lvl'||cmd==='nivel'||cmd==='level'){
        const needed=1000
        if((u.exp||0)<needed) return sendEco(conn,m,
            `📊 Necesitas *${needed} XP* para subir de nivel.\n` +
            `Tienes *${formatNum(u.exp||0)} XP*... faltan *${formatNum(needed-(u.exp||0))} XP* 📈\n\n` +
            `_¡Sigue trabajando y minando~ 🌸_`)
        u.exp-=needed; u.level=(u.level||1)+1
        return sendEco(conn,m,
            `🎉 *¡LEVEL UP!*\n\n⭐ Subiste al nivel *${u.level}*\n✨ XP restante: ${formatNum(u.exp)}\n\n_¡Itsuki está orgullosa de ti!_ 🌸🎊`)
    }

    // ── DONAR ─────────────────────────────────────────────────────────────────
    if(cmd==='donar'||cmd==='dar'||cmd==='transfer'){
        const target=m.quoted?.sender||m.mentionedJid?.[0]
        const amount=parseInt((text||'').replace(/@\S+/g,'').trim().split(/\s+/)[0])||0
        if(!target) return sendEco(conn,m,'🎁 Menciona a alguien para donarle 👀')
        if(target===sender) return sendEco(conn,m,'😂 No puedes donarte a ti mismo 💀')
        if(!amount||amount<=0) return sendEco(conn,m,
            `❌ Indica una cantidad\n_Ejemplo: *${prefix}donar 200 @usuario*_`)
        if((u.money||0)<amount) return sendEco(conn,m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatNum(u.money)} ${currency}*`)
        ensureUser(db,target)
        const impuesto=Math.floor(amount*0.10), neto=amount-impuesto
        u.money-=amount; db.users[target].money=(db.users[target].money||0)+neto
        return sendEco(conn,m,
            `🎁 *¡DONACIÓN REALIZADA!*\n\n` +
            `💸 Enviado: *${formatNum(amount)} ${currency}*\n` +
            `🏛️ Impuesto (10%): *-${formatNum(impuesto)} ${currency}*\n` +
            `✅ Recibido: *${formatNum(neto)} ${currency}*\n\n` +
            `_El gobierno siempre se lleva su parte~ 🌸_`,[sender,target])
    }

    // ── GIVE (owner) ──────────────────────────────────────────────────────────
    if(cmd==='give'||cmd==='addcoins'||cmd==='addexp'){
        if(!isOwner) return sendEco(conn,m,'👑 Solo el owner puede usar este comando')
        const target=m.quoted?.sender||m.mentionedJid?.[0]||sender
        const parts=(text||'').replace(/@\S+/g,'').trim().split(/\s+/)
        const isExp=['exp','xp'].includes(parts[0]?.toLowerCase())||cmd==='addexp'
        const amount=parseInt(isExp?parts[1]:parts[0])||0
        if(!amount||amount<=0) return sendEco(conn,m,
            `👑 Uso:\n› *${prefix}give 500 @usuario* — dar coins\n› *${prefix}give exp 200 @usuario* — dar exp`)
        ensureUser(db,target)
        const recv=db.users[target]
        if(isExp){
            recv.exp=(recv.exp||0)+amount
            return sendEco(conn,m,`✨ *+${formatNum(amount)} Exp* a @${target.split('@')[0]}\n📊 Total: *${formatNum(recv.exp)}*`,[target])
        }
        recv.money=(recv.money||0)+amount
        return sendEco(conn,m,`💰 *+${formatNum(amount)} ${currency}* a @${target.split('@')[0]}\n💵 Total: *${formatNum(recv.money)}*`,[target])
    }
}

handler.command = [
    'daily','diario',
    'cofre','chest',
    'work','trabajar','chamba',
    'minar','mine',
    'crime','crimen',
    'pesca','pescar','fish',
    'mendigo','pedir','beg',
    'rob','robar',
    'slots','casino','ruleta',
    'depositar','deposit','d',
    'retirar','withdraw','w',
    'bal','balance','saldo',
    'top','ranking','baltop',
    'lvl','nivel','level',
    'donar','dar','transfer',
    'give','addcoins','addexp'
]
export default handler
