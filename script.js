// script.js

// ukuran canvas mengikuti Template.png (720 x 463 di projek aslinya)
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 463;

const templateSrc = "./src/Template.png";

const form = document.getElementById("ktp-form");
const canvas = document.getElementById("ktp-canvas");
const ctx = canvas.getContext("2d");
const pasPhotoInput = document.getElementById("pas_photo");
const downloadLink = document.getElementById("download-link");
const clearBtn = document.getElementById("clear-btn");

// helper: load image dari url (Template / pas photo)
function loadImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// helper: load image dari file input
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

// load font biar canvas bisa pakai
async function loadFonts() {
  const fArrial = new FontFace("ArrialKTP", "url(./font/Arrial.ttf)");
  const fOcr = new FontFace("OcrKTP", "url(./font/Ocr.ttf)");
  const fSign = new FontFace("SignKTP", "url(./font/Sign.ttf)");

  await Promise.all([fArrial.load(), fOcr.load(), fSign.load()]);

  document.fonts.add(fArrial);
  document.fonts.add(fOcr);
  document.fonts.add(fSign);
}

// ambil data dari form
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

// gambar teks dengan pengaturan seperti di Pillow
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
  ctx.textBaseline = "middle"; // mendekati anchor="ms"
  ctx.fillStyle = "#000000";
  ctx.fillText(text, x, y);
}

// utama: generate KTP di canvas
async function generateKTP() {
  const data = getFormData();

  const file = pasPhotoInput.files[0];
  if (!file) {
    alert("Pas photo belum dipilih.");
    return;
  }

  // pastikan font & gambar ke-load
  await loadFonts();
  const [templateImg, pasPhotoImg] = await Promise.all([
    loadImageFromURL(templateSrc),
    loadImageFromFile(file)
  ]);

  // set ukuran canvas (kalau mau dinamis)
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // gambar template dulu
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // foto: resize ~0.4x dan tempel di (520,140)
  const scale = 0.4;
  const photoWidth = Math.round(pasPhotoImg.width * scale);
  const photoHeight = Math.round(pasPhotoImg.height * scale);
  ctx.drawImage(pasPhotoImg, 520, 140, photoWidth, photoHeight);

  // nama depan sebagai "tanda tangan"
  const sign = data.nama.split(" ")[0] || data.nama;

  // --- tulis teks, koordinat sama dengan create.py --- //
  // font size list: [25, 32, 16, 40]
  // fprov = Arrial, fnik = Ocr, fdata = Arrial, fsign = Sign

  // PROVINSI dan KOTA (anchor="ms")
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

  // NIK (OCR font, size 32)
  ctx.font = "32px OcrKTP";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";
  ctx.fillText(data.nik, 170, 105);

  // Data lain (font data = Arrial, size 16)
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

  // tempat & tanggal pembuatan + kota
  drawTextLeft(
    553,
    340,
    `KOTA ${data.kota.toUpperCase()}`,
    "ArrialKTP",
    16
  );
  drawTextLeft(570, 360, data.terbuat, "ArrialKTP", 16);

  // "tanda tangan"
  ctx.font = "40px SignKTP";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";
  ctx.fillText(sign, 540, 395);

  console.log("[XXX]GENERATE FAKE E-KTP SUCCESS");
  console.log(data);

  // buat link download
  const dataURL = canvas.toDataURL("image/png");
  downloadLink.href = dataURL;
  downloadLink.style.display = "inline-block";
}

// submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await generateKTP();
  } catch (err) {
    console.error(err);
    alert("Terjadi error saat generate E-KTP. Cek console browser.");
  }
});

// tombol bersihkan
clearBtn.addEventListener("click", () => {
  form.reset();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  downloadLink.style.display = "none";
});
