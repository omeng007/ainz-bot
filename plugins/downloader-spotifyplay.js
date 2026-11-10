import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) throw `Contoh penggunaan: ${usedPrefix}spotifyplay judul lagu\nContoh: ${usedPrefix}spotifyplay Ismail - Closed Doors`;
    
    try {
        await m.reply('🔍 Mencari lagu di Spotify...');
        
        const apiUrl = `https://api.nexray.eu.cc/downloader/spotifyplay?q=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        if (!res.ok) throw 'Gagal terhubung ke server Spotify';

        const data = await res.json();
        
        if (!data.status || !data.result) {
            throw 'Lagu tidak ditemukan di Spotify';
        }

        const result = data.result;
        const audioUrl = result.download_url;
        
        if (!audioUrl) {
            throw 'URL download tidak ditemukan';
        }

        // Buat caption informasi detail (teks biasa)
        let caption = '';
        caption += `🎵 *SPOTIFY MUSIC DOWNLOADER*\n\n`;
        caption += `📌 *Judul:* ${result.title || 'Tidak ada judul'}\n`;
        caption += `🎤 *Artis:* ${result.artist || 'Tidak diketahui'}\n`;
        caption += `💿 *Album:* ${result.album || 'Single'}\n`;
        caption += `⏱️ *Durasi:* ${result.duration || 'Tidak diketahui'}\n`;
        caption += `📅 *Rilis:* ${result.release_at || 'Tidak diketahui'}\n`;
        caption += `🔗 *URL:* ${result.url || 'Tidak ada'}\n\n`;
        caption += `📦 *Format:* MP3\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        // Kirim thumbnail + caption (teks biasa) - PASTI MUNCUL DI SEMUA WA
        await conn.sendMessage(m.chat, {
            image: { url: result.thumbnail || 'https://www.scdn.co/i/_global/open-graph-default.png' },
            caption: caption,
            mentions: [m.sender]
        }, { quoted: m });

        // Kirim audio
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${result.title || 'spotify'}.mp3`.replace(/[<>:"/\\|?*]/g, '')
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, e.message || 'Terjadi kesalahan, coba lagi nanti.', m);
    }
};

handler.help = ['spotifyplay', 'splay'];
handler.tags = ['downloader'];
handler.command = /^(spotifyplay|splay)$/i;
handler.limit = true;
handler.premium = false;

export default handler;