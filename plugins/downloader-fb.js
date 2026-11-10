import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh penggunaan:* ${usedPrefix}${command} https://www.facebook.com/watch/?v=1393572814172251`;
    if (!text.match(/facebook/gi)) throw '❌ URL harus dari Facebook!';
    
    await m.reply('🎬 *Mengunduh konten Facebook...*');
    
    try {
        // Gunakan API nexray.eu.cc
        const apiUrl = `https://api.nexray.eu.cc/downloader/facebook?url=${encodeURIComponent(text)}`;
        const res = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!res.data?.status || !res.data?.result) {
            throw new Error('Respons API tidak valid');
        }

        const result = res.data.result;
        let videoUrl = result.video_hd || result.video_sd;
        if (!videoUrl) throw new Error('Tidak ada video yang ditemukan');

        // Buat caption
        let caption = `📘 *FACEBOOK VIDEO*\n\n`;
        caption += `📌 *Judul:* ${result.title || 'Tidak diketahui'}\n`;
        caption += `📅 *Diunduh:* ${new Date().toLocaleDateString('id-ID')}\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        // Download video ke buffer
        let videoBuffer;
        try {
            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.facebook.com/'
                },
                timeout: 60000
            });
            videoBuffer = Buffer.from(videoRes.data);
        } catch (downloadErr) {
            console.error('Gagal mendownload video HD:', downloadErr.message);
            // Coba fallback ke video_sd jika video_hd gagal
            if (videoUrl === result.video_hd && result.video_sd) {
                videoUrl = result.video_sd;
                const videoRes2 = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.facebook.com/'
                    },
                    timeout: 60000
                });
                videoBuffer = Buffer.from(videoRes2.data);
            } else {
                throw downloadErr;
            }
        }

        // Kirim video
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            caption: caption,
            mimetype: 'video/mp4',
            fileName: 'facebook.mp4'
        }, { quoted: m });

    } catch (e) {
        console.error('Error detail:', e);
        let errorMsg = e.message || 'Terjadi kesalahan';
        conn.reply(m.chat, `❌ *Gagal mengunduh konten Facebook*\n\n${errorMsg}`, m);
    }
};

handler.help = ['facebook <url>'];
handler.tags = ['downloader'];
handler.command = /^(fb|facebook|facebookdl|fbdl|fbdown|dlfb)$/i;
handler.limit = true;

export default handler;