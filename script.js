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
