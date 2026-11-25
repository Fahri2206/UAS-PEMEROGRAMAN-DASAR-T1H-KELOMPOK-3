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
    total += daftar[i]!.harga * daftar[i]!.stok; // compound += dan operator *
  }
  return total;
}

// Fungsi dengan return number:
function biayaTambahan(kategori: string, ukuran: string): number {
  let biaya: number = 0; // biaya tambahan awal
  switch (kategori) {
    case "Kaos":
      switch (ukuran) {
        case "S":
        case "M":
        case "L":
          biaya += 0; // tanpa biaya tambahan
          break;
        case "XL":
          biaya += 10000; // XL kaos +Rp10.000
          break;
        default:
          gagal(`Ukuran "${ukuran}" tidak valid!`);
      }
      break;
    case "Kemeja":
      switch (ukuran) {
        case "S":
        case "M":
        case "L":
          biaya += 0;
          break;
        case "XL":
          biaya += 15000; // XL kemeja +Rp15.000
          break;
        default:
          gagal(`Ukuran "${ukuran}" tidak valid!`);
      }
      break;
    case "Jaket":
      switch (ukuran) {
        case "S":
        case "M":
        case "L":
          biaya += 0;
          break;
        case "XL":
          biaya += 20000; // XL jaket +Rp20.000
          break;
        default:
          gagal(`Ukuran "${ukuran}" tidak valid!`);
      }
      break;
    default:
      gagal(`Kategori "${kategori}" tidak ditemukan!`);
  }
  return biaya;
}

// Fungsi dengan return object: hitung diskon, voucher, pajak, dan total bayar (dari UTS)
function hitungTotal(
  hargaSatuan: number,
  jumlah: number,
  statusMember: string,
  pakaiVoucher: boolean,
): HasilHitung {
  let persentaseDiskon: number = 0; // 0.2 = 20%, 0.05 = 5%
  let potonganVoucher: number = 0; // potongan rupiah dari voucher

  // IF 1: diskon grosir (perbandingan >= dan === serta logika &&)
  if (jumlah >= 5 && statusMember === "member") {
    persentaseDiskon = 0.2;
  }
  // IF 2: diskon member standar (else if agar tidak ganda dengan 20%)
  else if (statusMember === "member") {
    persentaseDiskon = 0.05;
  }
  // IF 3: voucher potongan Rp10.000
  if (pakaiVoucher) {
    potonganVoucher = 10000;
  }

  const totalKotor: number = hargaSatuan * jumlah; // harga x jumlah
  let nilaiDiskon: number = totalKotor; // mulai dari total kotor
  nilaiDiskon *= persentaseDiskon; // compound *=: diskon dalam rupiah
  let totalBayar: number = totalKotor - nilaiDiskon; // setelah diskon
  totalBayar -= potonganVoucher; // compound -=
  const nilaiPajak: number = totalBayar * PAJAK_RATE; // pajak 11%
  totalBayar += nilaiPajak; // compound +=

  return {
    totalKotor,
    persentaseDiskon,
    nilaiDiskon,
    potonganVoucher,
    nilaiPajak,
    totalBayar,
  };
}

// Fungsi void: ringkasan stok (memakai operator / % dan compound /=)
function tampilRingkasanStok(): void {
  const total: number = hitungNilaiStok(dataProduk); // total nilai seluruh stok
  let rataPerProduk: number = total;
  rataPerProduk /= dataProduk.length; // compound /=: rata-rata per produk
  const sisaRibuan: number = total % 1000; // operator modulus %: sisa di bawah seribu
  const dalamRibuan: number = (total - sisaRibuan) / 1000; // operator /: nilai dalam ribuan
  console.log(`Total nilai stok     : ${formatRupiah(total)}`);
  console.log(`Rata-rata per produk : ${formatRupiah(rataPerProduk)}`);
  console.log(
    `Dalam ribuan         : ${dalamRibuan} ribu (sisa Rp ${sisaRibuan})`,
  );
}
// ============================================================
// BAGIAN 2B - FUNGSI BANTU INPUT & TAMPILAN (dipakai fitur CRUD + Search)
// ============================================================
// Fungsi bantu: input teks, tidak boleh kosong
async function tanyaTeks(pesan: string): Promise<string> {
  return tanyaValid(pesan, (j) => {
    if (j === "") {
      gagal("Isian tidak boleh kosong!");
    }
    return j;
  });
}

// Fungsi bantu: input bilangan bulat, tidak boleh kosong / huruf / desimal / negatif
async function tanyaAngka(pesan: string): Promise<number> {
  return tanyaValid(pesan, (j) => {
    const angka = Number(j); // Number("") = 0, jadi kosong dicek terpisah
    if (j === "" || !Number.isInteger(angka)) {
      gagal("Isian harus berupa bilangan bulat!");
    }
    if (angka < 0) {
      gagal("Nilai tidak boleh negatif!");
    }
    return angka;
  });
}

// Fungsi bantu: pilih kategori lewat nomor, mengembalikan nama kategori
async function pilihKategori(): Promise<string> {
  const daftar: Record<string, string> = {
    "1": "Kaos",
    "2": "Kemeja",
    "3": "Jaket",
  };
  return tanyaValid("Kategori (1. Kaos, 2. Kemeja, 3. Jaket): ", (j) => {
    if (!Object.prototype.hasOwnProperty.call(daftar, j)) {
      gagal(`Kategori "${j}" tidak valid! Pilih 1/2/3.`);
    }
    return daftar[j] as string;
  });
}

// Fungsi bantu: pilih ukuran lewat nomor, mengembalikan huruf ukuran
async function pilihUkuran(): Promise<string> {
  const daftar: Record<string, string> = {
    "1": "S",
    "2": "M",
    "3": "L",
    "4": "XL",
  };
  return tanyaValid("Ukuran (1. S, 2. M, 3. L, 4. XL): ", (j) => {
    if (!Object.prototype.hasOwnProperty.call(daftar, j)) {
      gagal(`Ukuran "${j}" tidak valid! Pilih 1/2/3/4.`);
    }
    return daftar[j] as string;
  });
}

// ============================================================
// BAGIAN 3 - FITUR CREATE (diusulkan: anggota 1, Progress 3)
// ============================================================
async function tambahProduk(): Promise<void> {
  console.log("--- Tambah Produk ---");
  const nama: string = await tanyaTeks("Nama produk: ");
  const kategori: string = await pilihKategori();
  const ukuran: string = await pilihUkuran();

  // Cegah duplikasi: nama + ukuran yang sama tidak boleh ada dua kali
  const sudahAda: boolean = dataProduk.some(
    (p) => p.nama.toLowerCase() === nama.toLowerCase() && p.ukuran === ukuran,
  );
  if (sudahAda) {
    console.log(
      `Produk "${nama}" ukuran ${ukuran} sudah ada. Gunakan menu Ubah.`,
    );
    return; // batalkan penambahan
  }

  const harga: number = await tanyaAngka("Harga dasar (Rp): ");
  const stok: number = await tanyaAngka("Stok awal (pcs): ");

  const produkBaru: Produk = {
    id: buatIdBaru(dataProduk), // ID unik otomatis
    nama,
    kategori,
    ukuran,
    harga,
    stok,
    aktif: stok > 0, // produk dengan stok 0 otomatis nonaktif
  };
  dataProduk.push(produkBaru); // simpan ke array
  console.log(
    `Produk "${nama}" berhasil ditambahkan dengan ID ${produkBaru.id}.`,
  );
}
// Fungsi void: menampilkan daftar produk dalam tabel rapi memakai forEach
function tampilTabel(daftar: Produk[]): void {
  console.log("-".repeat(78));
  console.log(
    "ID".padEnd(4) + "Nama".padEnd(22) + "Kategori".padEnd(10) + "Ukr".padEnd(5) +
    "Harga".padEnd(12) + "Stok".padEnd(6) + "Status",
  );
  console.log("-".repeat(78));
  daftar.forEach((p) => {
    console.log(
      String(p.id).padEnd(4) + p.nama.padEnd(22) + p.kategori.padEnd(10) + p.ukuran.padEnd(5) +
      formatRupiah(p.harga).padEnd(12) + String(p.stok).padEnd(6) + (p.aktif ? "Aktif" : "Nonaktif"),
    );
  });
  console.log("-".repeat(78));
}

// Fungsi void: menampilkan detail lengkap satu produk
function tampilDetail(p: Produk): void {
  cetakGaris();
  console.log(`ID        : ${p.id}`);
  console.log(`Nama      : ${p.nama}`);
  console.log(`Kategori  : ${p.kategori}`);
  console.log(`Ukuran    : ${p.ukuran}`);
  console.log(`Harga     : ${formatRupiah(p.harga)}`);
  console.log(`Stok      : ${p.stok}`);
  console.log(`Status    : ${p.aktif ? "Aktif (dijual)" : "Nonaktif"}`);
  cetakGaris();
}

// ============================================================
// BAGIAN 4 - FITUR READ (diusulkan: anggota 2, Progress 4)
// ============================================================
async function tampilSemuaProduk(): Promise<void> {
  // Pesan khusus jika data kosong
  if (dataProduk.length === 0) {
    console.log("Data produk masih kosong.");
    return;
  }
  console.log(`--- Daftar Produk (${dataProduk.length} data) ---`);
  tampilTabel(dataProduk);
}

async function tampilDetailProduk(): Promise<void> {
  if (dataProduk.length === 0) {
    console.log("Data produk masih kosong.");
    return;
  }
  const id: number = await tanyaAngka("Masukkan ID produk: ");
  const indeks: number = dataProduk.findIndex((p) => p.id === id); // -1 jika tidak ada
  if (indeks === -1) {
    console.log(`Produk dengan ID ${id} tidak ditemukan.`);
  } else {
    tampilDetail(dataProduk[indeks]!);
  }
}
// Fungsi bantu: konfirmasi Y/N, mengembalikan true jika Y
async function konfirmasi(pesan: string): Promise<boolean> {
  return tanyaValid(pesan, (j) => {
    const huruf: string = j.toLowerCase();
    huruf === "y" || huruf === "n" || gagal("Jawab dengan Y atau N!");
    return huruf === "y";
  });
}

// ============================================================
// BAGIAN 5 - FITUR UPDATE & DELETE (diusulkan: anggota 3, Progress 5)
// ============================================================
async function ubahProduk(): Promise<void> {
  if (dataProduk.length === 0) {
    console.log("Data produk masih kosong.");
    return;
  }
  const id: number = await tanyaAngka("Masukkan ID produk yang diubah: ");
  const produk: Produk | undefined = dataProduk.find((p) => p.id === id);
  if (produk === undefined) {
    console.log(`Produk dengan ID ${id} tidak ditemukan.`);
    return;
  }

  console.log("Data saat ini:");
  tampilDetail(produk); // tampilkan nilai lama dulu
  console.log("(Tekan Enter untuk melewati kolom yang tidak diubah)");

  // Nama: Enter = tidak diubah
  const namaBaru: string = (await rl.question(`Nama [${produk.nama}]: `)).trim();
  if (namaBaru !== "") {
    produk.nama = namaBaru;
  }

  // Kategori: Enter = tidak diubah
  const kategoriBaru: string = await tanyaValid(
    `Kategori [${produk.kategori}] (1. Kaos, 2. Kemeja, 3. Jaket): `,
    (j) => {
      const daftar: Record<string, string> = { "1": "Kaos", "2": "Kemeja", "3": "Jaket" };
      if (j === "") {
        return produk.kategori; // lewati
      }
      Object.keys(daftar).includes(j) || gagal(`Kategori "${j}" tidak valid! Pilih 1/2/3.`);
      return daftar[j];
    },
  );
  produk.kategori = kategoriBaru;

  // Ukuran: Enter = tidak diubah
  const ukuranBaru: string = await tanyaValid(
    `Ukuran [${produk.ukuran}] (1. S, 2. M, 3. L, 4. XL): `,
    (j) => {
      const daftar: Record<string, string> = { "1": "S", "2": "M", "3": "L", "4": "XL" };
      if (j === "") {
        return produk.ukuran; // lewati
      }
      Object.keys(daftar).includes(j) || gagal(`Ukuran "${j}" tidak valid! Pilih 1/2/3/4.`);
      return daftar[j];
    },
  );
  produk.ukuran = ukuranBaru;

  // Harga dan stok: Enter = tidak diubah, selain itu harus angka valid tidak negatif
  const bacaAngkaOpsional = (lama: number) => (j: string): number => {
    if (j === "") {
      return lama; // lewati
    }
    const angka = Number(j);
    if (!Number.isInteger(angka) || angka < 0) {
      gagal("Isian harus bilangan bulat tidak negatif!");
    }
    return angka;
  };
  produk.harga = await tanyaValid(`Harga [${produk.harga}]: `, bacaAngkaOpsional(produk.harga));
  produk.stok = await tanyaValid(`Stok [${produk.stok}]: `, bacaAngkaOpsional(produk.stok));

  // Status: Y = aktif, N = nonaktif, Enter = tidak diubah
  produk.aktif = await tanyaValid(
    `Status aktif [${produk.aktif ? "Y" : "N"}] (Y/N): `,
    (j) => {
      const huruf: string = j.toLowerCase();
      if (huruf === "") {
        return produk.aktif; // lewati
      }
      huruf === "y" || huruf === "n" || gagal("Jawab dengan Y atau N!");
      return huruf === "y";
    },
  );

  console.log(`Produk ID ${id} berhasil diubah.`);
}

async function hapusProduk(): Promise<void> {
  if (dataProduk.length === 0) {
    console.log("Data produk masih kosong, tidak ada yang bisa dihapus.");
    return;
  }
  const id: number = await tanyaAngka("Masukkan ID produk yang dihapus: ");
  const indeks: number = dataProduk.findIndex((p) => p.id === id);
  if (indeks === -1) {
    console.log(`Produk dengan ID ${id} tidak ditemukan.`);
    return;
  }

  tampilDetail(dataProduk[indeks]);
  const yakin: boolean = await konfirmasi("Yakin hapus produk ini? (Y/N): ");
  if (yakin) {
    dataProduk.splice(indeks, 1); // hapus 1 elemen pada posisi indeks
    console.log(`Produk ID ${id} berhasil dihapus.`);
  } else {
    console.log("Penghapusan dibatalkan.");
  }
}

// ============================================================
// BAGIAN 6 - FITUR SEARCH (belum dikerjakan)
// ============================================================
async function cariProduk(): Promise<void> {
  // TODO: kerjakan di progress berikutnya
  console.log("Fitur Cari Produk belum dikerjakan.");
}
// ============================================================
// BAGIAN 7 - TRANSAKSI KASIR
// ============================================================
async function transaksiKasir(): Promise<void> {
  // Langkah 1: pilih produk berdasarkan ID
  const id: number = await tanyaValid("Masukkan ID produk: ", (j) => {
    const angka = Number(j); // Number("3abc") = NaN sehingga ditolak
    if (!Number.isInteger(angka) || angka <= 0) {
      gagal("ID harus berupa bilangan bulat lebih dari 0!");
    }
    return angka;
  });
  const produk: Produk | undefined = dataProduk.find((p) => p.id === id); // cari berdasarkan id

  // NESTED 3 tingkat: if (produk ada) -> if (aktif) -> if (stok cukup)
  if (produk !== undefined) {
    if (produk.aktif) {
      if (produk.stok > 0) {
        console.log(`Produk: ${produk.nama} (${produk.kategori} ${produk.ukuran}) - stok ${produk.stok}`);

        // Langkah 2: jumlah beli
        const jumlah: number = await tanyaValid("Jumlah Item Dibeli (pcs): ", (j) => {
          const angka = Number(j);
          if (!Number.isInteger(angka) || angka <= 0) {
            gagal("Jumlah harus berupa bilangan bulat lebih dari 0!");
          }
          if (angka > produk.stok) {
            gagal(`Stok tidak cukup (tersisa ${produk.stok})!`);
          }
          return angka;
        });

        // Langkah 3: status member dan voucher (pilihan nomor seperti UTS)
        const statusMember: string = await tanyaValid("Status Member (1. Member, 2. Biasa): ", (j) => {
          const daftar: Record<string, string> = { "1": "member", "2": "biasa" };
          Object.keys(daftar).includes(j) || gagal(`Pilihan "${j}" tidak valid! Pilih 1/2.`);
          return daftar[j];
        });
        const pakaiVoucher: boolean = await tanyaValid("Gunakan Voucher? (1. Ada, 2. Tidak): ", (j) => {
          j === "1" || j === "2" || gagal(`Pilihan "${j}" tidak valid! Pilih 1/2.`);
          return j === "1";
        });

        // Langkah 4: hitung total dan kurangi stok
        const hargaSatuan: number = produk.harga + biayaTambahan(produk.kategori, produk.ukuran);
        const hasil: HasilHitung = hitungTotal(hargaSatuan, jumlah, statusMember, pakaiVoucher);
        produk.stok -= jumlah; // compound -=: stok berkurang

        // Langkah 5: cetak struk
        console.log("");
        cetakGaris();
        console.log(`        STRUK ${NAMA_TOKO}`);
        cetakGaris();
        console.log(`Pakaian      : ${produk.nama} (${produk.ukuran})`);
        console.log(`Harga Satuan : ${formatRupiah(hargaSatuan)}`);
        console.log(`Jumlah Item  : ${jumlah} pcs`);
        console.log(`Total Kotor  : ${formatRupiah(hasil.totalKotor)}`);
        console.log(`Diskon       : ${hasil.persentaseDiskon * 100}% (-${formatRupiah(hasil.nilaiDiskon)})`);
        console.log(`Voucher      : -${formatRupiah(hasil.potonganVoucher)}`);
        console.log(`Pajak (11%)  : ${formatRupiah(hasil.nilaiPajak)}`);
        console.log("-".repeat(40));
        console.log(`TOTAL BAYAR  : ${formatRupiah(hasil.totalBayar)}`);
        cetakGaris();
        // Peringatan jika stok menipis (operator perbandingan <)
        if (produk.stok < STOK_MINIMUM) {
          console.log(`Peringatan: stok ${produk.nama} tinggal ${produk.stok}.`);
        }
      } else {
        console.log("Stok produk habis.");
      }
    } else {
      console.log("Produk tidak dijual (nonaktif).");
    }
  } else {
    console.log(`Produk dengan ID ${id} tidak ditemukan.`);
  }
}

// ========================================================
// BAGIAN 8 - MENU UTAMA
// ========================================================

// Fungsi void: menampilkan daftar menu
function tampilMenu(): void {
  console.log("");
  cetakGaris();
  console.log(`      KASIR TOKO ${NAMA_TOKO}`);
  cetakGaris();
  console.log("1. Tambah produk");
  console.log("2. Tampil semua produk");
  console.log("3. Detail produk (berdasarkan ID)");
  console.log("4. Ubah produk");
  console.log("5. Hapus produk");
  console.log("6. Cari produk");
  console.log("7. Transaksi kasir");
  console.log("8. Nilai total stok");
  console.log("0. Keluar");
  cetakGaris();
}

// Fungsi utama: menu berulang (while) sampai pengguna memilih keluar
async function main(): Promise<void> {
  let jalan: boolean = true; // penanda program masih berjalan

  while (jalan) {
    tampilMenu();
    const pilihan: string = (await rl.question("Pilih menu: ")).trim();

    // switch dengan banyak case dan default; break di setiap case
    switch (pilihan) {
      case "1":
        await tambahProduk();
        break;
      case "2":
        await tampilSemuaProduk();
        break;
      case "3":
        await tampilDetailProduk();
        break;
      case "4":
        await ubahProduk();
        break;
      case "5":
        await hapusProduk();
        break;
      case "6":
        await cariProduk();
        break;
      case "7":
        await transaksiKasir();
        break;
      case "8":
        // Jika data kosong, rata-rata tidak bisa dihitung (hindari pembagian dengan nol)
        if (dataProduk.length === 0) {
          console.log("Data produk masih kosong.");
        } else {
          tampilRingkasanStok();
        }
        break;
      case "0":
        jalan = false; // hentikan perulangan
        console.log("Terima kasih, program selesai.");
        break;
      default:
        // Input menu tidak valid (kosong / bukan angka menu) ditangani di sini
        if (pilihan === "" || !(pilihan >= "0" && pilihan <= "8")) {
          console.log("Pilihan tidak valid, masukkan angka 0-8.");
        }
    }
  }
  rl.close(); // tutup input terminal agar program selesai bersih
}

// Jalankan program
main();
