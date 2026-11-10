import axios from 'axios';

const API = 'https://api.nexray.eu.cc/downloader/aio';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

const toBuffer = (url, timeout = 15000) => axios.get(url, { responseType: 'arraybuffer', timeout, headers: { 'User-Agent': UA, 'Referer': 'https://www.tiktok.com/' } }).then(r => Buffer.from(r.data));
const delay = ms => new Promise(res => setTimeout(res, ms));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))]);

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan Url Dari youtube, twitter, facebook, instagram, tiktok, dll\n\n*Example:* ${usedPrefix + command} https://...`;
    await m.reply(wait);

    try {
        const old = Date.now();
        const { data } = await withTimeout(axios.get(API, { params: { url: text }, timeout: 30000 }), 32000);
        if (!data?.status) throw 'Gagal mengambil data dari API';

        const res = data?.result?.result ?? data?.result;
        const raw = Array.isArray(res?.medias) ? res.medias : [];
        
        const seen = new Set();
        const medias = raw.filter(v => v?.url && !seen.has(v.url) && seen.add(v.url));

        const type = v => (v.type || '').toLowerCase();
        const ext = v => (v.extension || '').toLowerCase();
        const isImg = v => ['image', 'photo'].includes(type(v)) || ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext(v));
        const isVid = v => type(v) === 'video' || ['mp4', 'mkv', 'webm', 'mov'].includes(ext(v));
        const isAud = v => type(v) === 'audio' || ['mp3', 'm4a', 'aac', 'ogg', 'opus'].includes(ext(v));

        const videos = medias.filter(isVid).sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
        const imgs = medias.filter(isImg);
        const auds = medias.filter(isAud);

        const toSend = [];
        if (videos.length) toSend.push(videos[0]);
        toSend.push(...imgs, ...auds);

        if (!toSend.length) throw 'Tidak ada media ditemukan';

        let capt = `乂 *A I O  D L*\n\n◦ *Judul* : ${res.title || '-'}\n◦ *Author* : ${res.author || '-'}\n◦ *Source* : ${res.source || '-'}\n◦ *Fetch* : ${Date.now() - old} ms\n◦ *Total* : ${toSend.length}\n\n`;
        
        let first = true;
        for (const item of toSend) {
            const cap = first ? capt : '';
            const msgOpt = { quoted: first ? m : null };
            first = false;

            try {
                let payload;
                if (isImg(item)) payload = { image: await toBuffer(item.url), mimetype: 'image/jpeg', caption: cap };
                else if (isVid(item)) payload = { video: await toBuffer(item.url, 60000), caption: cap, mimetype: 'video/mp4' };
                else if (isAud(item)) payload = { audio: await toBuffer(item.url, 30000), mimetype: item.mimeType || 'audio/mpeg', ptt: false };
                else continue;

                await withTimeout(conn.sendMessage(m.chat, payload, msgOpt), 90000);
                await delay(3000); // Jeda 3 detik cegah stack loading
            } catch (e) {
                // Diamkan jika 1 media gagal, lanjut ke media berikutnya
            }
        }
    } catch (e) {
        throw e?.message || e;
    }
};

handler.help = handler.command = ['dl', 'alldl', 'aiodl', 'aio'];
handler.tags = ['downloader'];
handler.limit = true;
handler.fail = null;
handler.private = false;
handler.group = handler.premium = handler.owner = handler.admin = handler.botAdmin = false;

export default handler;