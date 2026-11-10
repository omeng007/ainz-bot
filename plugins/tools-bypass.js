import axios from 'axios';

const API_KEY = 'sc7SW'; // x-apikey untuk API theresav

const MAX_RETRIES = 3;      // percobaan
const RETRY_DELAY = 2000;   // jeda antar percobaan (ms)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, 
            `📌 Cara penggunaan:\n${usedPrefix}${command} <url>\nContoh: ${usedPrefix}${command} https://auth.platorelay.com/a?d=xxxxx`,
            m
        );
    }

    const url = text.trim();
    if (!/^https?:\/\/.+/.test(url)) {
        return conn.reply(m.chat, '❌ Masukkan URL yang valid!', m);
    }

    await conn.reply(m.chat, '⏳ Sedang memproses...', m);

    // Fungsi request ke API
    const requestApi = async () => {
        const { data } = await axios.get(
            `https://api.theresav.eu/api/bypass/delta?url=${encodeURIComponent(url)}`,
            {
                timeout: 60000,
                headers: {
                    'x-apikey': API_KEY
                }
            }
        );
        return data;
    };

    // Fungsi untuk mencoba API dengan retry
    const fetchWithRetry = async (requestFn, maxRetries = MAX_RETRIES) => {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const data = await requestFn();
                // Validasi response sukses dan ambil key
                if (data?.status === true && data?.key) {
                    return data.key; // return key saja
                }
                throw new Error(data?.message || 'API mengembalikan status false atau key tidak ditemukan');
            } catch (err) {
                lastError = err;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
            }
        }
        throw lastError;
    };

    try {
        const key = await fetchWithRetry(requestApi, MAX_RETRIES);
        await conn.reply(m.chat, key, m);
    } catch (error) {
        let errorMsg = '❌ Gagal bypass link.\n\n';
        errorMsg += `🔴 Error: ${error.message}\n\n`;
        errorMsg += `💡 Coba manual di browser: ${url}`;
        await conn.reply(m.chat, errorMsg, m);
    }
};

handler.help = ['bypass', 'by'];
handler.tags = ['tools'];
handler.command = /^(bypass|by)$/i;
handler.premium = true;
handler.limit = true;

export default handler;