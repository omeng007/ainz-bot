import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh penggunaan:* ${usedPrefix + command} https://www.youtube.com/watch?v=Z28dtg_QmFw`;
    if (!text.match(/youtu/gi)) throw '❌ URL harus dari YouTube!';
    
    await m.reply('🎵 *Mengunduh audio YouTube...*');

    try {
        // Ambil data dari endpoint utama
        const apiUrl = `https://api.nexray.eu.cc/downloader/ytmp3?url=${encodeURIComponent(text)}`;
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data?.status || !res.data?.result?.url) {
            throw new Error('URL download tidak ditemukan');
        }

        const result = res.data.result;

        // Convert thumbnail webp → jpg biar lebih mungkin tampil di WA
        let thumb = result.thumbnail || '';
        if (thumb) {
            thumb = thumb.replace('/vi_webp/', '/vi/').replace('.webp', '.jpg');
        }

        // Caption
        let caption = `🎵 *YOUTUBE MP3 DOWNLOADER*\n\n`;
        caption += `📌 *Judul:* ${result.title || 'Tidak diketahui'}\n`;
        caption += `⏱️ *Durasi:* ${result.duration || '-'}\n`;
        caption += `🎧 *Format:* ${result.format || '-'}\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        // Kirim thumbnail + caption (kalau gagal, kirim caption aja)
        if (thumb) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: thumb },
                    caption: caption
                }, { quoted: m });
            } catch {
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
            }
        } else {
            await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
        }

        // Kirim audio
        await conn.sendMessage(m.chat, {
            audio: { url: result.url },
            mimetype: 'audio/mpeg',
            fileName: `${result.title || 'audio'}.mp3`.replace(/[<>:"/\\|?*]/g, '')
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ *Gagal mengunduh audio*\n\n${e.message || 'Terjadi kesalahan, coba lagi nanti.'}`, m);
    }
};

handler.help = ['ytmp3 <url>', 'yta <url>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3|yta)$/i;
handler.limit = true;

export default handler;