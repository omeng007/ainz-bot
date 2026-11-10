import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh penggunaan:* ${usedPrefix}${command} judul lagu atau link YouTube`;
    
    try {
        await m.reply('🔍 *Mencari lagu di YouTube...*');

        // --- Step 1: Request ke API NexRay ---
        const { data } = await axios.get(
            `https://api.nexray.eu.cc/downloader/ytplay?q=${encodeURIComponent(text)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 }
        );

        if (!data.status || !data.result || !data.result.download_url) {
            throw new Error('Gagal mendapatkan data dari API');
        }

        const result = data.result;

        // Cek durasi (maksimal 1 jam)
        if (result.seconds && result.seconds >= 3600) {
            return conn.reply(m.chat, '❌ Video lebih dari 1 jam!', m);
        }

        // --- Step 2: Siapkan caption ---
        let caption = `🎵 *YOUTUBE AUDIO DOWNLOADER*\n\n`;
        caption += `📌 *Judul:* ${result.title}\n`;
        caption += `📺 *Channel:* ${result.channel}\n`;
        caption += `⏱️ *Durasi:* ${result.duration}\n`;
        caption += `👁️ *Views:* ${result.views}\n`;
        caption += `📅 *Diunggah:* ${result.upload_at}\n`;
        caption += `🔗 *URL:* ${result.url}\n\n`;
        caption += `📦 *Format:* MP3\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        // --- Step 3: Kirim thumbnail + caption ---
        await conn.sendMessage(m.chat, {
            image: { url: result.thumbnail },
            caption: caption,
            mentions: [m.sender]
        }, { quoted: m });

        // --- Step 4: Kirim audio ---
        await conn.sendMessage(m.chat, {
            audio: { url: result.download_url },
            mimetype: 'audio/mpeg',
            fileName: `${result.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ *Gagal mengunduh audio*\n\n${e.message || 'Terjadi kesalahan, coba lagi nanti.'}`, m);
    }
};

handler.help = ['play <judul>', 'song <judul>', 'ytaudio <judul>'];
handler.tags = ['downloader'];
handler.command = /^(play|song|ytaudio)$/i;
handler.limit = true;

export default handler;