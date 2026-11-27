// Tempel URL Web App Google Apps Script di sini setelah deployment.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRtu0n-FtMNUD3C-IXUvfwjEgPIBDKPAqdxJ7zyC09nKzQFVXZXlz2QJxPUcApRtNYxA/exec";
const form = document.getElementById('appointmentForm');
const statusEl = document.getElementById('formStatus');
const dateInput = form.elements.tanggal;
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset()*60000).toISOString().slice(0,10);
dateInput.min = localToday;
document.getElementById('year').textContent = new Date().getFullYear();
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (SCRIPT_URL.startsWith('TEMPEL')) {
    statusEl.textContent = 'Penghubung Google Spreadsheet belum dipasang. Ikuti panduan setup.';
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  // Membuat kode pengajuan unik
const kodePengajuan = "BK-" + crypto.randomUUID();

// Menambahkan kode ke data yang dikirim
data.kode = kodePengajuan;
console.log("DATA YANG DIKIRIM:", data);
console.log("KODE PENGAJUAN:", data.kode);
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true; button.textContent = 'Mengirim...'; statusEl.textContent = '';
  try {
    // Mode no-cors menghindari kendala CORS. Respons tidak bisa dibaca browser,
    // jadi status ini berarti permintaan terkirim, bukan bukti server berhasil menyimpan.
    await fetch(SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body:new URLSearchParams(data) });
    statusEl.textContent = 'Permintaan telah dikirim. Mohon tunggu konfirmasi dari Guru BK. Jika tidak muncul di spreadsheet, cek konfigurasi Apps Script.';
    form.reset(); dateInput.min = localToday;
  } catch (error) {
    statusEl.textContent = 'Pengiriman gagal. Periksa koneksi internet dan coba lagi.';
  } finally { button.disabled = false; button.innerHTML = 'Kirim Pengajuan <span>↗</span>'; }
});
// ===== CEK STATUS PENGAJUAN =====

const STATUS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRtu0n-FtMNUD3C-IXUvfwjEgPIBDKPAqdxJ7zyC09nKzQFVXZXlz2QJxPUcApRtNYxA/exec";

const statusForm = document.getElementById("statusForm");
const statusResult = document.getElementById("statusResult");

statusForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const kode = document.getElementById("statusCode").value.trim();
  statusResult.innerHTML = "<p>Memeriksa pengajuan...</p>";

  const callbackName = "statusCallback_" + Date.now();

  const script = document.createElement("script");
  const url = new URL(STATUS_SCRIPT_URL);

  url.searchParams.set("code", kode);
  url.searchParams.set("callback", callbackName);

  window[callbackName] = function (data) {
  if (!data.success) {
    statusResult.innerHTML = `<p>${escapeStatusHTML(data.message || "Pengajuan tidak ditemukan.")}</p>`;
  } else {
    const hasil = data.data;

    statusResult.innerHTML = `
      <div style="background:white; padding:20px; border-radius:12px; border:1px solid #ddd;">
        <h3>Hasil Pengajuan</h3>
        <p><strong>Nama:</strong> ${escapeStatusHTML(hasil.name || "-")}</p>
        <p><strong>Status:</strong> ${escapeStatusHTML(hasil.status || "Belum ada status")}</p>
        <p><strong>Jadwal Konseling:</strong> ${escapeStatusHTML(hasil.schedule || "Belum ditentukan")}</p>
      </div>
    `;
  }

  delete window[callbackName];
  script.remove();
};

  script.onerror = function () {
    statusResult.innerHTML = "<p>Gagal menghubungkan ke server. Coba lagi nanti.</p>";
    delete window[callbackName];
    script.remove();
  };

  script.src = url.toString();
  document.body.appendChild(script);
});

function escapeStatusHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}