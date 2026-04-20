/**
 * REACCIONES ANIME - ITSUKI NAKANO
 * #kiss #hug #kill #push #dormir #triste #pat #neko #waifu
 * Z0RT SYSTEMS 🌸
 */

const reaccion = async (m, conn, db, config) => {
    const { reactInicio, reactFin, videos, textos, errorMsg } = config
    try {
        await m.react(reactInicio)
        let who
        if (m.mentionedJid?.length > 0)  who = m.mentionedJid[0]
        else if (m.quoted)                who = m.quoted.sender
        else                              who = m.sender
        if (who.endsWith('@lid') || isNaN(who.split('@')[0])) {
            try {
                const meta  = await conn.groupMetadata(m.chat)
                const found = meta.participants.find(p => p.id === who || p.lid === who)
                if (found?.jid) who = found.jid
            } catch {}
        }
        const getName = (jid) => db.users?.[jid]?.name || jid.split('@')[0]
        const name  = getName(who)
        const name2 = m.pushName || m.sender.split('@')[0]
        let str
        if (m.mentionedJid?.length > 0) str = textos.mention(name2, name)
        else if (m.quoted)               str = textos.quoted(name2, name)
        else                             str = textos.solo(name2)
        const video = videos[Math.floor(Math.random() * videos.length)]
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🌸 ${global.botName||'Itsuki Nakano'}`, 'Reacciones Anime')
        await conn.sendMessage(m.chat, {
            video: { url: video }, gifPlayback: true,
            caption: str, mentions: [who], contextInfo: ctx
        }, { quoted: m })
        await m.react(reactFin)
    } catch (e) {
        console.error('[REACCION ERROR]', e.message)
        await m.react('💔'); m.reply(errorMsg)
    }
}

const CONFIGS = {
    kiss: {
        reactInicio:'🫦', reactFin:'💋',
        textos:{ mention:(a,b)=>`\`${a}\` *le dio besos a* \`${b}\` *( ˘ ³˘)♥*`, quoted:(a,b)=>`\`${a}\` *besó a* \`${b}\` 💋`, solo:(a)=>`\`${a}\` *se besó a sí mismo ( ˘ ³˘)♥*` },
        errorMsg:'💔 Algo salió mal enviando el beso~',
        videos:['https://files.catbox.moe/hu4p0g.mp4','https://files.catbox.moe/jevc51.mp4','https://files.catbox.moe/zekrvg.mp4','https://files.catbox.moe/czed90.mp4','https://files.catbox.moe/nnsf25.mp4','https://files.catbox.moe/zpxhw0.mp4','https://files.catbox.moe/er4b5i.mp4','https://files.catbox.moe/h462h6.mp4']
    },
    hug: {
        reactInicio:'🫂', reactFin:'🌸',
        textos:{ mention:(a,b)=>`\`${a}\` *le dio un abrazo a* \`${b}\` 🤗`, quoted:(a,b)=>`\`${a}\` *abrazó a* \`${b}\` 🌸`, solo:(a)=>`\`${a}\` *se abrazó a sí mismo* 🫂` },
        errorMsg:'💔 Algo salió mal enviando el abrazo~',
        videos:['https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4','https://telegra.ph/file/0e5b24907be34da0cbe84.mp4','https://telegra.ph/file/6bc3cd10684f036e541ed.mp4','https://telegra.ph/file/3e443a3363a90906220d8.mp4','https://telegra.ph/file/56d886660696365f9696b.mp4','https://telegra.ph/file/3eeadd9d69653803b33c6.mp4']
    },
    kill: {
        reactInicio:'🗡️', reactFin:'⚰️',
        textos:{ mention:(a,b)=>`\`${a}\` *mató a* \`${b}\` 💫`, quoted:(a,b)=>`\`${a}\` *eliminó a* \`${b}\` ⚰️`, solo:(a)=>`\`${a}\` *se mató a sí mismo* 😵` },
        errorMsg:'⚠️ Algo falló~',
        videos:['https://files.catbox.moe/pv2q2f.mp4','https://files.catbox.moe/oon0oa.mp4','https://files.catbox.moe/vibexk.mp4','https://files.catbox.moe/cv7odw.mp4','https://files.catbox.moe/bztm0m.mp4','https://files.catbox.moe/7ualwg.mp4']
    },
    push: {
        reactInicio:'🤜', reactFin:'💨',
        textos:{ mention:(a,b)=>`\`${a}\` *empujó a* \`${b}\` 🤜💨`, quoted:(a,b)=>`\`${a}\` *empujó a* \`${b}\` 😤`, solo:(a)=>`\`${a}\` *intentó empujarse a sí mismo* 😂` },
        errorMsg:'💔 Algo salió mal~',
        videos:['https://files.catbox.moe/pv2q2f.mp4','https://files.catbox.moe/oon0oa.mp4','https://files.catbox.moe/vibexk.mp4','https://files.catbox.moe/cv7odw.mp4']
    },
    dormir: {
        reactInicio:'😴', reactFin:'💤',
        textos:{ mention:(a,b)=>`\`${a}\` *se quedó dormido con* \`${b}\` 💤`, quoted:(a,b)=>`\`${a}\` *duerme junto a* \`${b}\` 😴`, solo:(a)=>`\`${a}\` *se quedó dormido* 💤 zzz` },
        errorMsg:'💔 Algo salió mal~',
        videos:['https://telegra.ph/file/9c69837650993b40113dc.mp4','https://telegra.ph/file/071f2b8d26bca81578dd0.mp4','https://telegra.ph/file/0af82e78c57f7178a333b.mp4','https://telegra.ph/file/8fb8739072537a63f8aee.mp4']
    },
    triste: {
        reactInicio:'😢', reactFin:'🌧️',
        textos:{ mention:(a,b)=>`\`${a}\` *está triste por* \`${b}\` 😢`, quoted:(a,b)=>`\`${a}\` *llora por* \`${b}\` 💧`, solo:(a)=>`\`${a}\` *está muy triste* 😔` },
        errorMsg:'💔 Algo salió mal~',
        videos:['https://telegra.ph/file/9c69837650993b40113dc.mp4','https://telegra.ph/file/071f2b8d26bca81578dd0.mp4','https://telegra.ph/file/4f81cb97f31ce497c3a81.mp4','https://telegra.ph/file/6d626e72747e0c71eb920.mp4']
    },
    pat: {
        reactInicio:'🥺', reactFin:'🌸',
        textos:{ mention:(a,b)=>`\`${a}\` *le dio palmaditas a* \`${b}\` 🥺`, quoted:(a,b)=>`\`${a}\` *palmeó a* \`${b}\` con cariño 🌸`, solo:(a)=>`\`${a}\` *se palmea a sí mismo* 🥺` },
        errorMsg:'💔 Algo salió mal~',
        videos:['https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4','https://telegra.ph/file/0e5b24907be34da0cbe84.mp4','https://telegra.ph/file/56d886660696365f9696b.mp4','https://telegra.ph/file/436624e53c5f041bfd597.mp4']
    },
    neko: {
        reactInicio:'🐱', reactFin:'✨',
        textos:{ mention:(a,b)=>`*Nyaa~* \`${a}\` *le hace mimos a* \`${b}\` 🐱✨`, quoted:(a,b)=>`\`${a}\` *modo neko con* \`${b}\` 🐱`, solo:(a)=>`*Nyaa~* \`${a}\` *activa el modo neko* 🐱✨` },
        errorMsg:'💔 Algo salió mal~',
        videos:['https://files.catbox.moe/hu4p0g.mp4','https://files.catbox.moe/jevc51.mp4','https://files.catbox.moe/zekrvg.mp4','https://files.catbox.moe/czed90.mp4']
    }
}

let handler = async (m, { conn, command, db }) => {
    const cmd = command.toLowerCase()
    const map = { kiss:'kiss',besar:'kiss',hug:'hug',abrazar:'hug',kill:'kill',matar:'kill',push:'push',empujar:'push',dormir:'dormir',sleep:'dormir',triste:'triste',sad:'triste',pat:'pat',palmear:'pat',neko:'neko',waifu:'neko' }
    const config = CONFIGS[map[cmd]]
    if (config) await reaccion(m, conn, db, config)
}

handler.command = ['kiss','besar','hug','abrazar','kill','matar','push','empujar','dormir','sleep','triste','sad','pat','palmear','neko','waifu']
handler.tags    = ['anime']
export default handler
