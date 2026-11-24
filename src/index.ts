// Impor readline/promises: rl.question() mengembalikan Promise (dipakai dengan await)
import * as readline from "readline/promises";

// ============================================================
// BAGIAN 1 - TIPE DATA, KONSTANTA & SEED
// ============================================================

// Entitas Produk beserta propertinya
interface Produk {
  id: number; // ID unik produk (number)
  nama: string; // nama produk (string)
  kategori: string; // "Kaos" | "Kemeja" | "Jaket" (string)
  ukuran: string; // "S" | "M" | "L" | "XL" (string)
  harga: number; // harga dasar per pcs (number)
  stok: number; // jumlah stok (number)
  aktif: boolean; // true = dijual, false = tidak dijual (boolean)
}

// Hasil perhitungan transaksi (dipakai untuk mencetak struk)
interface HasilHitung {
  totalKotor: number;
  persentaseDiskon: number;
  nilaiDiskon: number;
  potonganVoucher: number;
  nilaiPajak: number;
  totalBayar: number;
}

// Konstanta (const) untuk nilai yang tetap
const NAMA_TOKO: string = "TOKO JAYA ABADI"; // nama toko
const PAJAK_RATE: number = 0.11; // PPN 11%
const STOK_MINIMUM: number = 5; // batas peringatan stok menipis

// Data disimpan di memori memakai array (let karena isinya berubah)
let dataProduk: Produk[] = [
  {
    id: 1,
    nama: "Kaos Polos Hitam",
    kategori: "Kaos",
    ukuran: "M",
    harga: 50000,
    stok: 20,
    aktif: true,
  },
  {
    id: 2,
    nama: "Kaos Sablon Band",
    kategori: "Kaos",
    ukuran: "XL",
    harga: 65000,
    stok: 12,
    aktif: true,
  },
  {
    id: 3,
    nama: "Kemeja Flanel",
    kategori: "Kemeja",
    ukuran: "L",
    harga: 90000,
    stok: 8,
    aktif: true,
  },
  {
    id: 4,
    nama: "Kemeja Putih Kerja",
    kategori: "Kemeja",
    ukuran: "M",
    harga: 95000,
    stok: 3,
    aktif: true,
  },
  {
    id: 5,
    nama: "Jaket Hoodie",
    kategori: "Jaket",
    ukuran: "L",
    harga: 150000,
    stok: 10,
    aktif: true,
  },
  {
    id: 6,
    nama: "Jaket Denim",
    kategori: "Jaket",
    ukuran: "XL",
    harga: 175000,
    stok: 0,
    aktif: false,
  },
];

// Antarmuka readline: stdin = ketikan kasir, stdout = tampilan terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================================
// BAGIAN 2 - FUNGSI BANTU (diusulkan: anggota 1, Progress 2)
// ============================================================
// Fungsi TANPA parameter dan TANPA return (void): garis pemisah
function cetakGaris(): void {
  console.log("=".repeat(40)); // cetak 40 karakter '='
}

// Fungsi dengan parameter dan return string: format angka menjadi "Rp 50000"
function formatRupiah(angka: number): string {
  return `Rp ${angka.toFixed(0)}`; // toFixed(0) = tanpa angka di belakang koma
}

// Fungsi bantu: melempar error untuk input salah (tipe never = tidak pernah selesai normal)
function gagal(pesan: string): never {
  throw new Error(pesan);
}

// Fungsi bantu: bertanya, memvalidasi, dan MENGULANG (loop while) jika input salah
// validasi() mengembalikan nilai bersih atau memanggil gagal()
async function tanyaValid<T>(
  pesan: string,
  validasi: (jawaban: string) => T,
): Promise<T> {
  while (true) {
    try {
      const jawaban: string = (await rl.question(pesan)).trim(); // trim buang spasi
      return validasi(jawaban); // jika valid, keluar dari perulangan
    } catch (err) {
      // Input salah: tampilkan pesan lalu ulangi pertanyaan yang sama
      console.log(`[ERROR] ${(err as Error).message} Silakan coba lagi.\n`);
    }
  }
}

// Fungsi dengan parameter dan return number: ID baru yang unik
function buatIdBaru(daftar: Produk[]): number {
  let idTerbesar: number = 0; // menyimpan ID terbesar sementara
  // Perulangan for...of: telusuri semua produk
  for (const produk of daftar) {
    if (produk.id > idTerbesar) {
      idTerbesar = produk.id; // simpan ID yang lebih besar
    }
  }
  return idTerbesar + 1; // ID baru = terbesar + 1
}

// Fungsi dengan parameter dan return number (hasil hitung): total nilai seluruh stok
function hitungNilaiStok(daftar: Produk[]): number {
  let total: number = 0;
  // Perulangan for biasa
  for (let i = 0; i < daftar.length; i++) {
    total += daftar[i].harga * daftar[i].stok; // compound += dan operator *
  }
  return total;
}
