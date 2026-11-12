function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
function parseJson(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === "/api/health" && request.method === "GET")
        return json({ ok: true, message: "Presensi Mahasiswa API aktif" });

      if (path === "/api/users" && request.method === "GET") {
        const { results = [] } = await env.DB.prepare(
          "SELECT nim, nama, prodi, descriptor_json, created_at FROM users ORDER BY created_at DESC"
        ).all();
        return json({ users: results.map(row => ({
          nim: row.nim, nama: row.nama, prodi: row.prodi,
          descriptor: parseJson(row.descriptor_json, []), createdAt: row.created_at
        })) });
      }

      if (path === "/api/users" && request.method === "POST") {
        const body = await request.json();
        const nim = String(body.nim || "").trim();
        const nama = String(body.nama || "").trim();
        const prodi = String(body.prodi || "").trim();
        const descriptor = body.descriptor;
        if (!nim || !nama || !prodi || !Array.isArray(descriptor) ||
            descriptor.length !== 16 || !descriptor.every(Number.isFinite))
          return json({ error: "Nama, NIM, program studi, dan data wajah 16 dimensi wajib diisi." }, 400);
        try {
          await env.DB.prepare(
            "INSERT INTO users (nim, nama, prodi, descriptor_json, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(nim, nama, prodi, JSON.stringify(descriptor),
            body.createdAt || new Date().toISOString()).run();
          return json({ ok: true, message: "Mahasiswa berhasil disimpan." }, 201);
        } catch (error) {
          if (String(error).toLowerCase().includes("unique"))
            return json({ error: "NIM sudah terdaftar." }, 409);
          throw error;
        }
      }

      if (path.startsWith("/api/users/") && request.method === "DELETE") {
        const nim = decodeURIComponent(path.slice("/api/users/".length)).trim();
        if (!nim) return json({ error: "NIM tidak valid." }, 400);
        const result = await env.DB.prepare("DELETE FROM users WHERE nim = ?").bind(nim).run();
        if (!result.meta?.changes) return json({ error: "Mahasiswa tidak ditemukan." }, 404);
        return json({ ok: true, message: "Data mahasiswa berhasil dihapus." });
      }

      if (path === "/api/attendances" && request.method === "GET") {
        const { results = [] } = await env.DB.prepare(
          "SELECT id, nim, nama, prodi, timestamp, date_str, time_str, similarity FROM attendances ORDER BY timestamp DESC LIMIT 1000"
        ).all();
        return json({ attendances: results.map(row => ({
          id: row.id, nim: row.nim, nama: row.nama, prodi: row.prodi,
          timestamp: row.timestamp, dateStr: row.date_str,
          timeStr: row.time_str, similarity: row.similarity
        })) });
      }

      if (path === "/api/attendances" && request.method === "POST") {
        const body = await request.json();
        const nim = String(body.nim || "").trim();
        const nama = String(body.nama || "").trim();
        const prodi = String(body.prodi || "").trim();
        const timestamp = Number(body.timestamp);
        const dateStr = String(body.dateStr || "");
        const timeStr = String(body.timeStr || "");
        const similarity = Number(body.similarity);
        if (!nim || !nama || !prodi || !Number.isFinite(timestamp) ||
            !dateStr || !timeStr || !Number.isFinite(similarity))
          return json({ error: "Data presensi tidak lengkap atau tidak valid." }, 400);
        const result = await env.DB.prepare(
          "INSERT INTO attendances (nim, nama, prodi, timestamp, date_str, time_str, similarity) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(nim, nama, prodi, timestamp, dateStr, timeStr, similarity).run();
        return json({ ok: true, id: result.meta.last_row_id }, 201);
      }

      if (path.startsWith("/api/")) return json({ error: "Endpoint API tidak ditemukan." }, 404);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Worker error:", error);
      return json({ error: "Terjadi kesalahan pada server. Periksa konfigurasi Cloudflare D1." }, 500);
    }
  }
};
