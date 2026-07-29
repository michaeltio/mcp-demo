import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';

type Karyawan = {
  id: number;
  nama: string;
  posisi: string;
  divisi: string;
  gaji: number;
};

const karyawan: Karyawan[] = [
  {
    id: 1,
    nama: 'William Bennett',
    posisi: 'Backend Engineer',
    divisi: 'Engineering',
    gaji: 15000000,
  },
  {
    id: 2,
    nama: 'Charlotte Hayes',
    posisi: 'UI/UX Designer',
    divisi: 'Product',
    gaji: 12000000,
  },
  {
    id: 3,
    nama: 'Daniel Foster',
    posisi: 'HR Generalist',
    divisi: 'People',
    gaji: 10000000,
  },
];

let nextId = karyawan.length + 1;

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const server = new McpServer(
  { name: 'karyawan-mcp-demo', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.registerTool(
  'list_karyawan',
  {
    title: 'List Karyawan',
    description: 'Ambil semua data karyawan.',
    inputSchema: z.object({}),
  },
  async () => json({ total: karyawan.length, data: karyawan }),
);

server.registerTool(
  'get_karyawan',
  {
    title: 'Get Karyawan',
    description: 'Ambil satu karyawan berdasarkan id.',
    inputSchema: z.object({
      id: z.number().int().describe('ID karyawan'),
    }),
  },
  async ({ id }) => {
    const found = karyawan.find(k => k.id === id);
    if (!found) return json({ error: `Karyawan dengan id ${id} tidak ditemukan` });
    return json(found);
  },
);

server.registerTool(
  'create_karyawan',
  {
    title: 'Create Karyawan',
    description: 'Tambah karyawan baru.',
    inputSchema: z.object({
      nama: z.string().describe('Nama lengkap, contoh: Sarah Mitchell'),
      posisi: z.string().describe('Jabatan, contoh: Backend Engineer'),
      divisi: z.string().describe('Divisi, contoh: Engineering'),
      gaji: z.number().describe('Gaji per bulan dalam rupiah'),
    }),
  },
  async ({ nama, posisi, divisi, gaji }) => {
    const baru: Karyawan = { id: nextId++, nama, posisi, divisi, gaji };
    karyawan.push(baru);
    return json({ message: 'Karyawan berhasil dibuat', data: baru });
  },
);

server.registerTool(
  'update_karyawan',
  {
    title: 'Update Karyawan',
    description: 'Ubah data karyawan. Field yang tidak diisi tidak berubah.',
    inputSchema: z.object({
      id: z.number().int().describe('ID karyawan yang mau diubah'),
      nama: z.string().optional(),
      posisi: z.string().optional(),
      divisi: z.string().optional(),
      gaji: z.number().optional(),
    }),
  },
  async ({ id, ...perubahan }) => {
    const found = karyawan.find(k => k.id === id);
    if (!found) return json({ error: `Karyawan dengan id ${id} tidak ditemukan` });

    for (const [key, value] of Object.entries(perubahan)) {
      if (value !== undefined) (found as Record<string, unknown>)[key] = value;
    }
    return json({ message: 'Karyawan berhasil diupdate', data: found });
  },
);

server.registerTool(
  'delete_karyawan',
  {
    title: 'Delete Karyawan',
    description: 'Hapus karyawan berdasarkan id.',
    inputSchema: z.object({
      id: z.number().int().describe('ID karyawan yang mau dihapus'),
    }),
  },
  async ({ id }) => {
    const index = karyawan.findIndex(k => k.id === id);
    if (index === -1) return json({ error: `Karyawan dengan id ${id} tidak ditemukan` });

    const [dihapus] = karyawan.splice(index, 1);
    return json({ message: 'Karyawan berhasil dihapus', data: dihapus });
  },
);

await server.connect(new StdioServerTransport());
console.error('weather MCP server running on stdio');
