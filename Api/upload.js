export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Baca body sebagai buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Di sini, body yang dikirim dari Frontend adalah FormData.
    // Untuk demo simple ini, kita tidak parse beneran FormData,
    // tapi anggap kamu kirim langsung binary PNG (bisa disesuaikan).
    //
    // Kalau mau 100% sesuai FormData, bisa pakai library `busboy` atau `formidable`.

    // Buat data URL (supaya bisa langsung dipakai sebagai src IMG di web lain)
    const base64 = buffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    // ✅ Kirim balik ke frontend
    return res.status(200).json({
      url: dataUrl,
      note: "Ini data URL, bukan URL file permanen",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}

// Penting untuk mematikan bodyParser default Vercel/Next:
export const config = {
  api: {
    bodyParser: false,
  },
};
