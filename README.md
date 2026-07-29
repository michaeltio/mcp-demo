# Karyawan MCP Demo

Server [Model Context Protocol (MCP)](https://modelcontextprotocol.io) sederhana untuk demo — menyediakan operasi CRUD (Create, Read, Update, Delete) data karyawan yang bisa dipanggil langsung oleh Claude (Claude Code maupun Claude Desktop) sebagai *tools*.

Data disimpan **in-memory** (array JavaScript), jadi hanya untuk keperluan belajar/demo — data akan hilang setiap kali server di-restart.

## Fungsinya apa?

Server ini mengekspos 5 tools MCP yang bisa dipanggil Claude untuk mengelola data karyawan tanpa perlu database:

| Tool | Deskripsi | Input |
|---|---|---|
| `list_karyawan` | Ambil semua data karyawan | - |
| `get_karyawan` | Ambil satu karyawan berdasarkan `id` | `id` (number) |
| `create_karyawan` | Tambah karyawan baru | `nama`, `posisi`, `divisi`, `gaji` |
| `update_karyawan` | Ubah data karyawan (field yang tidak diisi tidak berubah) | `id`, `nama?`, `posisi?`, `divisi?`, `gaji?` |
| `delete_karyawan` | Hapus karyawan berdasarkan `id` | `id` (number) |

Setiap karyawan punya field: `id` (number, auto-increment), `nama`, `posisi`, `divisi`, `gaji`.

## File utama

- `src/index.ts` — satu-satunya file source. Berisi definisi data karyawan (seed data) dan registrasi 5 tools MCP di atas, lalu menjalankan server lewat stdio transport.
- `package.json` — dependency utama: [`@modelcontextprotocol/server`](https://www.npmjs.com/package/@modelcontextprotocol/server) dan `zod` (untuk validasi input tool).

## Instalasi

### Requirement

- [Node.js](https://nodejs.org) versi 20+ (disarankan v22/v24 karena bisa langsung menjalankan file `.ts` tanpa build/transpile terpisah).

### 1. Clone repo

```bash
git clone <url-repo-ini>
cd mcp-demo
```

### 2. Install dependency

```bash
npm install
```

### 3. Coba jalankan manual (opsional, untuk memastikan server jalan)

```bash
node src/index.ts
```

Jika muncul log `weather MCP server running on stdio` di terminal, server sudah berjalan dan menunggu koneksi lewat stdio. Tekan `Ctrl+C` untuk berhenti.

## Menghubungkan ke Claude Code

Jalankan perintah berikut dari root project ini (ganti path sesuai lokasi clone di komputer kamu):

```bash
claude mcp add karyawan-mcp-demo -- node ./src/index.ts
```

Cek apakah server sudah terdaftar:

```bash
claude mcp list
```

Setelah itu, tools `list_karyawan`, `get_karyawan`, `create_karyawan`, `update_karyawan`, dan `delete_karyawan` bisa langsung dipanggil Claude Code di sesi chat kamu.

## Menghubungkan ke Claude Desktop

1. Buka file konfigurasi MCP milik Claude Desktop (buat file/folder-nya kalau belum ada):
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Tambahkan entry berikut ke bagian `mcpServers` (sesuaikan path `src/index.ts` dengan lokasi clone repo di komputermu):

   ```json
   {
     "mcpServers": {
       "karyawan-mcp-demo": {
         "command": "node",
         "args": ["/path/ke/mcp-demo/src/index.ts"]
       }
     }
   }
   ```

3. Simpan file, lalu **restart Claude Desktop** sepenuhnya (keluar dari aplikasi, buka lagi).

4. Buka chat baru, cek ikon "tools"/MCP di Claude Desktop — server `karyawan-mcp-demo` beserta 5 tools-nya seharusnya sudah muncul dan siap dipakai.

## Contoh pemakaian

Setelah terhubung, tinggal minta ke Claude, misalnya:

- "Tampilkan semua karyawan"
- "Tambah karyawan baru bernama Sarah Mitchell, posisi Backend Engineer, divisi Engineering, gaji 15000000"
- "Update gaji karyawan dengan id `...` jadi 16000000"
- "Hapus karyawan dengan id `...`"

Claude akan otomatis memanggil tool MCP yang sesuai.
