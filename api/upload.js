import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false, // kita mau baca stream binary sendiri
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Baca body sebagai buffer (binary PNG dari canvas)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 2. Simpan ke Blob Storage (akses publik)
    const filename = `fake-ektp-${Date.now()}.png`;

    const blob = await put(filename, buffer, {
      access: "public",          // penting: biar bisa diakses lewat URL
      contentType: "image/png",  // jenis file
    });

    // 3. Balikin URL publik ke frontend
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      error: "Upload failed",
      message: err.message || "Unknown error",
    });
  }
}
