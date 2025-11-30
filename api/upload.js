import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // baca body sebagai buffer (binary PNG dari canvas)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // simpan ke Vercel Blob Storage (akses publik)
    const blob = await put(`fake-ektp-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png",
    });

    // blob.url = URL HTTPS publik
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}