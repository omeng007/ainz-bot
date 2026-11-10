import axios from 'axios';

// ==================== HELPER (DIPERCEPAT) ====================
// Timeout download dipersingkat (Image: 10s, Video: 45s, Audio: 20s)
const toBuffer = (url, timeout = 10000) => axios.get(url, { 
    responseType: 'arraybuffer', 
    timeout, 
    maxContentLength: 80 * 1024 * 1024, 
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://www.tiktok.com/' } 
}).then(r => Buffer.from(r.data));

const delay = ms => new Promise(res => setTimeout(res, ms));
// Timeout antrean API dipersingkat jadi 20 detik
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))]);

// ==================== HANDLER UTAMA ====================
let handler = (m) => m;

handler.before = async function (m, { conn, isPrems }) {
    let chat = global.db.data.chats[m.chat];
    if (!m.text) return;
    if (m.text.startsWith("=>") || m.text.startsWith(">") || m.text.startsWith(".") || m.text.startsWith("#") || m.text.startsWith("!") || m.text.startsWith("/") || m.text.startsWith("\\")) return;
    if (chat.isBanned) return;
    if (!m.text.includes("http")) return;

    let text = m.text.replace(/\n+/g, " ");

    const tiktokRegex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/i;
    const douyinRegex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.|v\.)?(?:douyin\.com\/)(?:\S+)?$/i;
    const instagramRegex = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/i;
    const facebookRegex = /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/i;
    const pinRegex = /^(?:https?:\/\/)?(?:www\.|id\.)?(?:pinterest\.(?:com|it|co\.[a-z]{2}|[a-z]{2})|pin\.it)\/(?:pin\/)?[^\/\s]+(?:\/)?$/i;
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S+)?$/i;
    const spotifyRegex = /^(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]+)(?:\S+)?$/i;
    const twitterRegex = /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)(?:\?[^#]*)?(?:#.*)?$/i;
    const threadsRegex = /^(https?:\/\/)?(www\.)?(threads\.(net|com))(\/[^\s]*)?(\?[^\s]*)?$/;
    const capcutRegex = /^(https?:\/\/)?(www\.)?capcut\.com\/(t|tv|tv2|template|link|vc)\/[A-Za-z0-9_-]+(\/)?(\?.*)?$/i;
    const snackvideoRegex = /^(https?:\/\/)?(www\.)?(snackvideo|kwai)\.com\/@[A-Za-z0-9_.-]+\/video\/[0-9]+(\?.*)?$/i;
    const xiaohongshuRegex = /^(https?:\/\/)?(www\.)?(xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+|xhslink\.com\/[a-zA-Z0-9/]+)(\?.*)?$/i;
    const soundcloudRegex = /^(https?:\/\/)?(www\.|m\.)?soundcloud\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?(\?.*)?$/i;
    const cocofunRegex = /^(https?:\/\/)?(www\.)?icocofun\.com\/share\/post\/\d+(\?.*)?$/i;

    let match = text.match(tiktokRegex) || text.match(douyinRegex) || text.match(instagramRegex) || 
                text.match(facebookRegex) || text.match(pinRegex) || text.match(youtubeRegex) || 
                text.match(spotifyRegex) || text.match(twitterRegex) || text.match(threadsRegex) || 
                text.match(capcutRegex) || text.match(snackvideoRegex) || text.match(xiaohongshuRegex) || 
                text.match(soundcloudRegex) || text.match(cocofunRegex);

    if (match) {
        await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _aio(match[0], m, conn);
    }

    return true;
};

export default handler;

// ==================== FUNGSI AIO (ALL IN ONE) ====================
async function _aio(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit <= 0)
            return conn.reply(m.chat, "❌ Limit kamu habis!", m);

        const old = new Date();
        
        // Timeout API dipercepat jadi 20 detik
        const { data } = await withTimeout(
            axios.get('https://api.nexray.eu.cc/downloader/aio', { params: { url: link }, timeout: 20000 }),
            20000
        );

        if (!data?.status) throw new Error('Gagal mengambil data dari API');

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

        if (!toSend.length) throw new Error('Tidak ada media ditemukan');

        global.db.data.users[m.sender].limit -= 1;

        // Menambahkan Tag di bagian bawah caption
        let capt = `🍟 *Fetching* : ${(new Date() - old) * 1} ms\n📸 *Total Media:* ${toSend.length}\n\n> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;
        
        let first = true;
        for (const item of toSend) {
            const cap = first ? capt : '';
            const msgOpt = first ? { quoted: m } : {}; 
            first = false;

            try {
                let payload;
                if (isImg(item)) {
                    payload = { image: await toBuffer(item.url, 10000), mimetype: 'image/jpeg', caption: cap };
                } else if (isVid(item)) {
                    payload = { video: await toBuffer(item.url, 45000), caption: cap, mimetype: 'video/mp4' };
                } else if (isAud(item)) {
                    payload = { audio: await toBuffer(item.url, 20000), mimetype: item.mimeType || 'audio/mpeg', ptt: false };
                } else continue;

                // Timeout kirim dipersingkat jadi 45 detik
                await withTimeout(conn.sendMessage(m.chat, payload, msgOpt), 45000);
                
                // Jeda antar pesan dipercepat jadi 1.5 detik (1500ms) agar tidak stuck tapi tetap cepat
                await delay(1500); 
            } catch (err) {
                // Skip jika 1 media gagal
            }
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("[AIO Error]", e);
        conn.reply(m.chat, `⚠️ Gagal mengunduh: ${e.message || e}`, m);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }
}