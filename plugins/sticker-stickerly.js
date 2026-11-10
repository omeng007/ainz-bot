import axios from 'axios';
import { Sticker } from 'wa-sticker-formatter';

const API_KEY = 'fdv_XWn4D-3Qc_tNE2K-44cd8w';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh penggunaan:*\n${usedPrefix}${command} <query>\n${usedPrefix}${command} dl <url>\n📌 *Contoh:* ${usedPrefix}${command} masha`;

    const args = text.trim().split(/\s+/);
    if (args[0].toLowerCase() === 'dl' || args[0].toLowerCase() === 'download') {
        if (!args[1]) throw '❌ Masukkan URL pack Stickerly!';
        await m.reply('⏳ *Mengunduh pack stiker...*');
        return await downloadPack(conn, m, args[1]);
    }
    await m.reply('🔍 *Mencari stiker...*');
    await searchPack(conn, m, text, usedPrefix);
};

handler.help = ['stickerly <query>', 'stickerly dl <url>'];
handler.tags = ['search'];
handler.command = /^(stickerly|sly)$/i;
handler.limit = true;

export default handler;

// ===== SEARCH =====
async function searchPack(conn, m, query, prefix) {
    try {
        const { data } = await axios.get(
            `https://api.ferdev.my.id/sticker/stickerlysearch?query=${encodeURIComponent(query)}&apikey=${API_KEY}`,
            { timeout: 15000 }
        );
        if (!data.success || !data.result.length) throw '❌ Tidak ditemukan.';

        const packs = data.result.slice(0, 20);
        let txt = `🔍 *STICKERLY SEARCH*\n📌 *Query:* ${query}\n📦 *Ditemukan:* ${data.result.length}\n\n`;
        packs.forEach((p, i) => {
            txt += `${i+1}. ${p.name}\n👤 ${p.author}\n🖼️ ${p.stickerCount} | 👁️ ${p.viewCount} | ⬇️ ${p.exportCount} | ${p.isAnimated ? '🎞️' : '🖼️'}\n🔗 ${p.url}\n\n`;
        });
        txt += `📥 *Download:* ${prefix}${m.command} dl <url>\n\n`;
        txt += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        await conn.sendMessage(m.chat, {
            image: { url: packs[0].thumbnailUrl || packs[0].thumbnail },
            caption: txt,
            mentions: [m.sender]
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ *Gagal mencari stiker*\n\n${e.message || 'Coba lagi nanti.'}`, m);
    }
}

// ===== DOWNLOAD =====
async function downloadPack(conn, m, url) {
    try {
        const { data } = await axios.get(
            `https://api.ferdev.my.id/sticker/stickerlydownload?link=${encodeURIComponent(url)}&apikey=${API_KEY}`,
            { timeout: 30000 }
        );
        if (!data.success || !data.result.stickers.length) throw new Error('Tidak ada stiker.');

        const { name, stickers } = data.result;
        const total = stickers.length;
        await conn.reply(m.chat, `⬇️ *${name}* (${total} stiker) — mengirim semua...`, m);

        let sent = 0;
        for (let i = 0; i < total; i++) {
            const imgUrl = stickers[i].imageUrl || stickers[i].url;
            if (!imgUrl) continue;
            try {
                const { data: buffer } = await axios.get(imgUrl, {
                    responseType: 'arraybuffer',
                    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://sticker.ly/' }
                });
                const sticker = new Sticker(buffer, {
                    pack: name || 'Stickerly',
                    author: '© ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ',
                    type: 'full',
                    quality: 80
                });
                await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() });
                sent++;
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                // Fallback kirim gambar
                try {
                    await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption: `Stiker #${i+1}` });
                    sent++;
                } catch (_) {}
            }
        }
        await conn.reply(m.chat, `✅ *Berhasil mengirim ${sent} dari ${total} stiker.*`, m);
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ *Gagal mengunduh pack*\n\n${e.message || 'Coba manual di ' + url}`, m);
    }
}