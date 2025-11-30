// script.js

// ukuran canvas mengikuti Template.png (720 x 463)
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 463;

const templateSrc = "./src/Template.png";

const form = document.getElementById("ktp-form");
const canvas = document.getElementById("ktp-canvas");
const ctx = canvas.getContext("2d");
const pasPhotoInput = document.getElementById("pas_photo");

const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");

// ===============================
// HELPER: Load image dari URL
// ===============================
function loadImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ===============================
// HELPER: Load image dari file input
// ===============================
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ===============================
// Load Fonts untuk canvas
// ===============================
async function loadFonts() {
  const fArrial = new FontFace("ArrialKTP", "url(./font/Arrial.ttf)");
  const fOcr = new FontFace("OcrKTP", "url(./font/Ocr.ttf)");
  const fSign = new FontFace("SignKTP", "url(./font/Sign.ttf)");

  await Promise.all([fArrial.load(), fOcr.load(), fSign.load()]);

  document.fonts.add(fArrial);
  document.fonts.add(fOcr);
  document.fonts.add(fSign);
}

// ===============================
// Ambil data form
// ===============================
function getFormData() {
  const get = (id) => document.getElementById(id).value;

  return {
    provinsi: get("provinsi"),
    kota: get("kota"),
    nik: get("nik"),
    nama: get("nama"),
    ttl: get("ttl"),
    jenis_kelamin: get("jenis_kelamin"),
    golongan_darah: get("golongan_darah"),
    alamat: get("alamat"),
    rtRw: get("rtRw"),
    kel_desa: get("kel_desa"),
    kecamatan: get("kecamatan"),
    agama: get("agama"),
    status: get("status"),
    pekerjaan: get("pekerjaan"),
    kewarganegaraan: get("kewarganegaraan"),
    masa_berlaku: get("masa_berlaku"),
    terbuat: get("terbuat")
  };
}

// ===============================
// Helper tulis teks
// ===============================
function drawTextLeft(x, y, text, font, size) {
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, x, y);
}

function drawTextCenter(x, y, text, font, size) {
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, x, y);
}

// ===============================
// MAIN: Generate E-KTP
// ===============================
async function generateKTP() {
  const data = getFormData();

  const file = pasPhotoInput.files[0];
  if (!file) {
    alert("Pas photo belum dipilih!");
    return;
  }

  await loadFonts();

  const [templateImg, pasPhotoImg] = await Promise.all([
    loadImageFromURL(templateSrc),
    loadImageFromFile(file)
  ]);

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // 1. gambar template
  ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // ================================
  // 2. FOTO – CROP TENGAH + SHRINK
  // ================================
  const PHOTO_X = 520;
  const PHOTO_Y = 80;   // dinaikkan sedikit
  const PHOTO_W = 200;
  const PHOTO_H = 280;  // frame lebih pendek

  const frameAspect = PHOTO_W / PHOTO_H;
  const imgAspect = pasPhotoImg.width / pasPhotoImg.height;

  let srcX, srcY, srcW, srcH;

  // crop tengah (kiri-kanan / atas-bawah)
  if (imgAspect > frameAspect) {
    // foto lebih lebar → potong kiri-kanan
    srcH = pasPhotoImg.height;
    srcW = srcH * frameAspect;
    srcX = (pasPhotoImg.width - srcW) / 2;
    srcY = 0;
  } else {
    // foto lebih tinggi → potong atas-bawah
    srcW = pasPhotoImg.width;
    srcH = srcW / frameAspect;
    srcX = 0;
    srcY = (pasPhotoImg.height - srcH) / 2;
  }

  // scale supaya muat, lalu perkecil lagi (shrink)
  const baseScale = Math.min(PHOTO_W / srcW, PHOTO_H / srcH);
  const SHRINK = 0.78; // tweak di sini kalau mau lebih kecil/besar
  const scale = baseScale * SHRINK;

  const drawW = srcW * scale;
  const drawH = srcH * scale;

  // center di dalam area foto
  const drawX = PHOTO_X + (PHOTO_W - drawW) / 2;
  const drawY = PHOTO_Y + (PHOTO_H - drawH) / 2;

  ctx.drawImage(
    pasPhotoImg,
    srcX, srcY, srcW, srcH,
    drawX, drawY, drawW, drawH
  );

  // ================================
  // 3. Teks Judul Provinsi & Kota
  // ================================
  drawTextCenter(
    380,
    45,
    `PROVINSI ${data.provinsi.toUpperCase()}`,
    "ArrialKTP",
    25
  );
  drawTextCenter(
    380,
    70,
    `KOTA ${data.kota.toUpperCase()}`,
    "ArrialKTP",
    25
  );

  // ================================
  // 4. NIK
  // ================================
  ctx.font = "32px OcrKTP";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";
  ctx.fillText(data.nik, 170, 105);

  // ================================
  // 5. Data lain
  // ================================
  const upper = (s) => s.toUpperCase();

  drawTextLeft(190, 145, upper(data.nama), "ArrialKTP", 16);
  drawTextLeft(190, 168, upper(data.ttl), "ArrialKTP", 16);
  drawTextLeft(190, 191, upper(data.jenis_kelamin), "ArrialKTP", 16);
  drawTextLeft(463, 190, upper(data.golongan_darah), "ArrialKTP", 16);
  drawTextLeft(190, 212, upper(data.alamat), "ArrialKTP", 16);
  drawTextLeft(190, 234, upper(data.rtRw), "ArrialKTP", 16);
  drawTextLeft(190, 257, upper(data.kel_desa), "ArrialKTP", 16);
  drawTextLeft(190, 279, upper(data.kecamatan), "ArrialKTP", 16);
  drawTextLeft(190, 300, upper(data.agama), "ArrialKTP", 16);
  drawTextLeft(190, 323, upper(data.status), "ArrialKTP", 16);
  drawTextLeft(190, 346, upper(data.pekerjaan), "ArrialKTP", 16);
  drawTextLeft(190, 369, upper(data.kewarganegaraan), "ArrialKTP", 16);
  drawTextLeft(190, 390, upper(data.masa_berlaku), "ArrialKTP", 16);

  // ================================
  // 6. Kota & Tanggal – LEBIH KECIL & LEBIH TURUN
  // ================================
  drawTextLeft(
    553,
    345,   // turun sedikit dari 330
    `KOTA ${data.kota.toUpperCase()}`,
    "ArrialKTP",
    12      // lebih kecil dari 16
  );
  drawTextLeft(
    570,
    365,    // turun sedikit dari 350
    data.terbuat,
    "ArrialKTP",
    12
  );

  // ================================
  // 7. Tanda Tangan
  // ================================
  const sign = data.nama.split(" ")[0] || data.nama;
  ctx.font = "40px SignKTP";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(sign, 540, 395);

  console.log("[OK] Generated");
}

// ===============================
// EVENT: Submit
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await generateKTP();
});

// ===============================
// EVENT: Bersihkan
// ===============================
clearBtn.addEventListener("click", () => {
  form.reset();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// ===============================
// EVENT: Download PNG
// ===============================
downloadBtn.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      alert("Generate dulu sebelum download!");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fake-ektp.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
});
