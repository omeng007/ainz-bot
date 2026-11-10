const __filename = import.meta.filename;
// Timezone
process.env.TZ = 'Asia/Jakarta';

// Pengaturan Bot disini Semua
global.owner = ["6287755090983"]; // wajib di isi tidak boleh kosong
global.mods = ["6287755090983"]; // wajib di isi tidak boleh kosong
global.prems = ["6287755090983"]; // wajib di isi tidak boleh kosong
global.nameowner = "Ainz"; // wajib di isi tidak boleh kosong
global.numberowner = "6287755090983"; // wajib di isi tidak boleh kosong
global.mail = "support@Ainz"; // wajib di isi tidak boleh kosong
global.gc = "https://chat.whatsapp.com/Lhqaza71YXN1H8R6Di2YFp"; // wajib di isi tidak boleh kosong
global.instagram = "https://instagram.com/Ainzvoldi"; // wajib di isi tidak boleh kosong
global.wm = "© ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ"; // isi nama bot atau nama kalian
global.wait = "_*Tunggu sedang di proses...*_"; // ini pesan simulasi loading
global.eror = "_*Server Error*_"; // ini pesan saat terjadi kesalahan
global.stiker_wait = "*⫹⫺ Stiker sedang dibuat...*"; // ini pesan simulasi saat loading pembuatan sticker
global.thumb = "https://files.catbox.moe/7klh4y.jpeg";
global.packname = "© ʜᴀꜱʜɪʀᴀ - ᴀɪ"; // watermark stikcker packname
global.author = "ʙʏ ᴀɪɴᴢ"; // watermark stikcker author
global.maxwarn = "5"; // Peringatan maksimum Warn




// APIKEY INI WAJIB UNTUK DI ISI! //
global.btc = "gpdV9HTp";



// AKSESKEY INI DI ISI JIKA DIPERLUKAN JADI TIDAK WAJIB DI ISI! (e.g suno ai (ai music ) & fitur prem lainnya//
global.aksesKey = "YOUR_AKSESKEY_HERE";

// Tidak boleh diganti atau di ubah
global.APIs = {
  btc: "https://api.botcahx.eu.org",
};

//Tidak boleh diganti atau di ubah
global.APIKeys = {
  "https://api.botcahx.eu.org": global.btc,
};

import fs from 'fs';
import chalk from 'chalk';
import { pathToFileURL } from 'url';
let file = import.meta.filename;
fs.unwatchFile(file);
fs.watchFile(file, async () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  await import(pathToFileURL(file).href + '?update=' + Date.now());
});
