import axios from 'axios';

const API_THERE  = 'https://api.theresav.eu/api/download/instagram';
const API_THERE_KEY = 'sc7SW';
const API_V1     = 'https://api.nexray.eu.cc/downloader/instagram';
const UA         = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_BYTES  = 200 * 1024 * 1024;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh:* ${usedPrefix}${command} https://www.instagram.com/reel/xxxxx/`;
    if (!/^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(text))
        throw '❌ URL harus dari Instagram!';

    await m.reply('⏳ *Mengunduh konten Instagram...*');

    const fetched = await fetchInstagram(text);
    if (!fetched) throw '❌ Gagal mengambil data dari semua API';
    if (!fetched.media.length) throw '❌ Media tidak ditemukan';

    const { media, meta } = fetched;
    const caption = buildCaption(meta, media.length);

    for (let i = 0; i < media.length; i++) {
        const item = media[i];
        const isVideo = item.type === 'video';

        const fileCaption = media.length === 1
            ? caption
            : i === 0
                ? `${caption}\n\n${isVideo ? '🎬' : '🖼️'} 1/${media.length}`
                : `${isVideo ? '🎬' : '🖼️'} ${i + 1}/${media.length}\n\n> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        try {
            const buf = await downloadBuffer(item.url);
            await conn.sendMessage(m.chat, isVideo
                ? { video: buf, caption: fileCaption, mimetype: 'video/mp4' }
                : { image: buf, caption: fileCaption },   // ✅ image, bukan sticker
                { quoted: m });
        } catch (e) {
            console.warn(`[IG] media #${i + 1} gagal:`, e.message);
            try {
                const ext = isVideo ? 'mp4' : 'jpg';
                await conn.sendFile(m.chat, item.url, `ig_${i + 1}.${ext}`, fileCaption, m);
            } catch (e2) {
                await conn.reply(m.chat, `⚠️ Media #${i + 1} gagal dikirim: ${e2.message}`, m);
            }
        }

        if (i < media.length - 1) await sleep(1500);
    }
};

/* ---------- Fetching API ---------- */
async function fetchInstagram(url) {
    // 1) theresav (API baru, tanpa v2 nexray lagi)
    try {
        const r = await axios.get(API_THERE, {
            params: { url },
            headers: { 'x-apikey': API_THERE_KEY, 'User-Agent': UA },
            timeout: 60_000
        });
        if (r.data?.status && r.data?.data?.items?.length) {
            return normalizeTheresav(r.data.data);
        }
    } catch (e) { console.warn('[IG] theresav gagal:', e.message); }

    // 2) fallback nexray v1
    try {
        const r = await axios.get(API_V1, { params: { url }, timeout: 60_000 });
        const result = r.data?.result;
        if (r.data?.status && result) {
            const arr = Array.isArray(result) ? result : result.media;
            if (Array.isArray(arr) && arr.length) return normalizeV1(arr, result);
        }
    } catch (e) { console.warn('[IG] v1 gagal:', e.message); }

    return null;
}

/* ---------- Normalizers ---------- */
function normalizeTheresav(d) {
    return {
        media: d.items.map(it => {
            const isVideo = /video/i.test(it.type || '') || !!it.video;
            return {
                type: isVideo ? 'video' : 'image',
                url : isVideo ? (it.video || it.url) : (it.image || it.url)
            };
        }).filter(x => !!x.url),
        meta: {
            username: d.username || d.user?.username || d.author || 'Tidak diketahui',
            caption : (d.caption && d.caption !== '-') ? d.caption
                    : (d.description && d.description !== '-') ? d.description : '',
            likes   : Number(d.likes) || 0,
            comments: Number(d.comments) || 0,
            takenAt : d.created_at
                ? new Date(d.created_at).toLocaleString('id-ID')
                : (d.uploadDate || '')
        }
    };
}

function normalizeV1(arr, raw = {}) {
    return {
        media: arr.map(m => {
            const isVideo = /video|mp4|reel/i.test(m.type || '')
                         || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(m.url || '');
            return {
                type: isVideo ? 'video' : 'image',
                url : m.url
            };
        }).filter(x => !!x.url),
        meta: {
            username: raw.username || raw.author || 'Tidak diketahui',
            caption : (raw.title && raw.title !== '-') ? raw.title
                    : (raw.caption && raw.caption !== '-') ? raw.caption : '',
            likes   : Number(raw.likes) || 0,
            comments: Array.isArray(raw.comments)
                ? raw.comments.length
                : Number(raw.comment) || 0,
            takenAt : raw.taken_at
                ? new Date(raw.taken_at * 1000).toLocaleString('id-ID')
                : ''
        }
    };
}

/* ---------- Util ---------- */
function buildCaption(meta, count) {
    let c = `📸 *INSTAGRAM DOWNLOADER*\n\n`;
    c += `👤 *Username:* ${meta.username}\n`;
    if (meta.caption)
        c += `📝 *Caption:* ${meta.caption.slice(0, 200)}${meta.caption.length > 200 ? '...' : ''}\n`;
    c += `\n📊 *Statistik:*\n   • ❤️ ${meta.likes} suka\n`;
    if (meta.comments > 0) c += `   • 💬 ${meta.comments} komentar\n`;
    if (meta.takenAt)      c += `   • 🕒 ${meta.takenAt}\n`;
    c += `\n🔄 *Jumlah Media:* ${count}\n> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;
    return c;
}

async function downloadBuffer(url) {
    const r = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120_000,
        maxContentLength: MAX_BYTES,
        maxBodyLength: MAX_BYTES,
        headers: {
            'User-Agent': UA,
            'Referer': 'https://www.instagram.com/',
            'Accept': '*/*'
        }
    });
    if (!r.data || r.data.byteLength === 0) throw new Error('Buffer kosong');
    return r.data;
}

handler.help    = ['instagram <url>'];
handler.tags    = ['downloader'];
handler.command = /^(ig|instagram|igdl|instagramdl|igstory)$/i;
handler.limit   = true;

export default handler;