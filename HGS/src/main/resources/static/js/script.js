// ==========================================
// 1. GLOBAL DEÃƒâ€Ã‚ÂÃƒâ€Ã‚Â°Ãƒâ€¦Ã‚ÂKENLER VE ARAYÃƒÆ’Ã…â€œZ ELEMENTLERÃƒâ€Ã‚Â°
// ==========================================
// Tum istekler tarayicinin adresine gider (localhost, LAN IP veya domain)
const API_BASE = window.location.origin;

function escapeHtml(s) {
    if (s == null || s === '') return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

let kullanicilar = [];
let cihazlar = [];
let loglar = []; 

const modal = document.getElementById('kullaniciModal');
const modalBaslik = document.getElementById('modalBaslik');
const cihazModal = document.getElementById('cihazModal');
const modalCihazBaslik = document.getElementById('modalCihazBaslik');

// ==========================================
// 2. GÃƒâ€Ã‚Â°RÃƒâ€Ã‚Â°Ãƒâ€¦Ã‚Â YAP / ÃƒÆ’Ã¢â‚¬Â¡IKIÃƒâ€¦Ã‚Â YAP (YETKÃƒâ€Ã‚Â°LENDÃƒâ€Ã‚Â°RME)
// ==========================================
function adminGiris(event) {
    event.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const hata = document.getElementById('hataMesaji');

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("hgs_oturum", "acik");
        window.location.href = "/index.html";
    } else {
        hata.style.display = "block";
        hata.innerText = "HatalÃƒâ€Ã‚Â± kullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± adÃƒâ€Ã‚Â± veya Ãƒâ€¦Ã…Â¸ifre!";
    }
}

function cikisYap() {
    localStorage.removeItem("hgs_oturum");
    window.location.href = "/login.html";
}

// ==========================================
// 3. SAYFA YÃƒÆ’Ã…â€œKLENDÃƒâ€Ã‚Â°Ãƒâ€Ã‚ÂÃƒâ€Ã‚Â°NDE ÃƒÆ’Ã¢â‚¬Â¡ALIÃƒâ€¦Ã‚ÂACAKLAR (KORUMA DAHÃƒâ€Ã‚Â°L)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;

    if (currentPath.endsWith("index.html") || currentPath === "/") {
        if (localStorage.getItem("hgs_oturum") !== "acik") {
            window.location.href = "/login.html";
            return;
        }

        veritabanindanKullanicilariGetir();
        veritabanindanCihazlariGetir();
        veritabanindanLoglariGetir();

        const apiEl = document.getElementById('apiKokGoster');
        if (apiEl) apiEl.textContent = API_BASE;
    }
});

// ==========================================
// 4. GENEL ARAYÃƒÆ’Ã…â€œZ (NAVÃƒâ€Ã‚Â°GASYON & DASHBOARD)
// ==========================================
function menuyuGoster(bolumId) {
    const tumBolumler = document.querySelectorAll('.sayfa-bolumu');
    tumBolumler.forEach(bolum => bolum.style.display = 'none');

    const gosterilecekBolum = document.getElementById(bolumId);
    if (gosterilecekBolum) {
        gosterilecekBolum.style.display = 'block';
    }
}

function dashboardGuncelle() {
    const toplamKullanici = kullanicilar.length;
    const toplamLog = loglar.length;
    const onaylananGirisler = loglar.filter(l => l.sonuc && l.sonuc.includes("ONAYLANDI")).length;
    
    const ozetMetni = `Sisteme hoÃƒâ€¦Ã…Â¸ geldiniz.<br><br>
        &bull; Toplam KayÃƒâ€Ã‚Â±tlÃƒâ€Ã‚Â± KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â±: <b>${toplamKullanici}</b><br>
        &bull; Toplam GiriÃƒâ€¦Ã…Â¸ Denemesi: <b>${toplamLog}</b><br>
        &bull; BaÃƒâ€¦Ã…Â¸arÃƒâ€Ã‚Â±lÃƒâ€Ã‚Â± GeÃƒÆ’Ã‚Â§iÃƒâ€¦Ã…Â¸ (Onaylanan): <b style='color:green'>${onaylananGirisler}</b>`;
    
    const dashboardElemani = document.getElementById('dashboardOzet');
    if(dashboardElemani) dashboardElemani.innerHTML = ozetMetni;
}

// ==========================================
// 5. KULLANICI YÃƒÆ’Ã¢â‚¬â€œNETÃƒâ€Ã‚Â°MÃƒâ€Ã‚Â° MODÃƒÆ’Ã…â€œLÃƒÆ’Ã…â€œ
// ==========================================
function veritabanindanKullanicilariGetir() {
    fetch(`${API_BASE}/api/users`)
        .then(response => response.json())
        .then(data => {
            kullanicilar = data;
            tabloyuGuncelle();
            dashboardGuncelle();
        })
        .catch(error => console.error("KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â±lar ÃƒÆ’Ã‚Â§ekilirken hata:", error));
}

function tabloyuGuncelle() {
    const tbody = document.querySelector("#kullanicilar tbody");
    if (!tbody) return;
    tbody.innerHTML = ""; 

    kullanicilar.forEach(k => {
        const tamIsim = (k.ad || "") + " " + (k.soyad || "");
        const durumMetni = k.aktifMi ? "Aktif" : "Pasif";

        // GiriÃƒâ€¦Ã…Â¸ yÃƒÆ’Ã‚Â¶ntemi ikonlarÃƒâ€Ã‚Â±
        const kartIkon  = k.kartNo            ? `<span class="yontem-ikon yontem-kart"  title="Kart: ${escapeHtml(k.kartNo)}">&#128266; Kart</span>` : '';
        const noIkon    = k.ogrenciNo         ? `<span class="yontem-ikon yontem-no"    title="Okul No: ${escapeHtml(k.ogrenciNo)}">&#128290; No</span>` : '';
        const fpIkon    = k.parmakIziSensorId ? `<span class="yontem-ikon yontem-fp"    title="FP Slot: ${escapeHtml(k.parmakIziSensorId)}">&#128406; FP:${escapeHtml(k.parmakIziSensorId)}</span>` : '';
        const yontemler = (kartIkon + noIkon + fpIkon) || '<span class="yontem-yok">&#10060; Yok</span>';

        const row = `<tr>
            <td>${k.userId}</td>
            <td>${escapeHtml(tamIsim.trim())}</td>
            <td>${escapeHtml(k.ogrenciNo || '-')}</td>
            <td class="yontem-hucre">${yontemler}</td>
            <td>${escapeHtml(k.rol || '-')}</td>
            <td><span class="status-${durumMetni.toLowerCase()}">${durumMetni}</span></td>
            <td>
                <button class="edit-btn" onclick="kullaniciDuzenle(${k.userId})">DÃƒÆ’Ã‚Â¼zenle</button>
                <button class="delete-btn" onclick="kullaniciSil(${k.userId})">Sil</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function modaliKapat() {
    modal.style.display = 'none';
}

function yeniKullaniciEkle() {
    document.getElementById('kullaniciFormu').reset(); 
    document.getElementById('formKullaniciId').value = ''; 
    modalBaslik.innerText = 'Yeni KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± Ekle';
    sensorCihazSecenekleriniGuncelle();
    const uyari = document.getElementById('formUyari');
    if (uyari) uyari.style.display = 'none';
    modal.style.display = 'block'; 
}

function kullaniciDuzenle(id) {
    const kullanici = kullanicilar.find(k => k.userId === id);
    if (kullanici) {
        document.getElementById('formKullaniciId').value = kullanici.userId;
        document.getElementById('formAdSoyad').value = (kullanici.ad || "") + " " + (kullanici.soyad || "");
        document.getElementById('formNo').value = kullanici.ogrenciNo || "";
        document.getElementById('formKartNo').value = kullanici.kartNo || "";
        document.getElementById('formParmakIziSlot').value = kullanici.parmakIziSensorId || "";
        document.getElementById('formRol').value = kullanici.rol || "";
        document.getElementById('formDurum').value = kullanici.aktifMi ? "Aktif" : "Pasif";
        sensorCihazSecenekleriniGuncelle();

        const uyari = document.getElementById('formUyari');
        if (uyari) uyari.style.display = 'none';

        modalBaslik.innerText = 'KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± DÃƒÆ’Ã‚Â¼zenle';
        modal.style.display = 'block';
    }
}

function kullaniciKaydet(event) {
    event.preventDefault();

    const formAdSoyad = document.getElementById('formAdSoyad').value.trim();
    const isimParcalari = formAdSoyad.split(' ');
    const soyad = isimParcalari.length > 1 ? isimParcalari.pop() : "";
    const ad = isimParcalari.join(' ');
    const idDegeri = document.getElementById('formKullaniciId').value;

    const kartNo = document.getElementById('formKartNo').value.trim();
    const fpSlot = document.getElementById('formParmakIziSlot').value.trim();

    // UyarÃƒâ€Ã‚Â±: en az bir giriÃƒâ€¦Ã…Â¸ yÃƒÆ’Ã‚Â¶ntemi ÃƒÆ’Ã‚Â¶nerilir
    const uyariDiv = document.getElementById('formUyari');
    if (!kartNo && !fpSlot) {
        if (uyariDiv) {
            uyariDiv.style.display = 'block';
            uyariDiv.innerHTML = '&#9888;&#65039; <strong>UyarÃƒâ€Ã‚Â±:</strong> Kart numarasÃƒâ€Ã‚Â± ve parmak izi slot girilmedi. Bu kullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± sadece <strong>okul numarasÃƒâ€Ã‚Â±yla</strong> giriÃƒâ€¦Ã…Â¸ yapabilir.';
        }
    } else {
        if (uyariDiv) uyariDiv.style.display = 'none';
    }

    const gonderilecekKullanici = {
        ...(idDegeri && { userId: idDegeri }),
        ad: ad,
        soyad: soyad,
        ogrenciNo: document.getElementById('formNo').value,
        kartNo: kartNo || null,
        parmakIziSensorId: fpSlot || null,
        rol: document.getElementById('formRol').value,
        aktifMi: document.getElementById('formDurum').value === 'Aktif'
    };

    const url = idDegeri ? `${API_BASE}/api/users/${idDegeri}` : `${API_BASE}/api/users`;
    const method = idDegeri ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gonderilecekKullanici)
    })
    .then(response => {
        if (!response.ok) throw new Error("Sunucu reddetti.");
        return response.json();
    })
    .then(() => {
        alert(idDegeri ? "KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± gÃƒÆ’Ã‚Â¼ncellendi!" : "Yeni kullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± eklendi!");
        modaliKapat();
        veritabanindanKullanicilariGetir(); 
    })
    .catch(error => {
        console.error("HATA:", error);
        alert("Ãƒâ€Ã‚Â°Ãƒâ€¦Ã…Â¸lem baÃƒâ€¦Ã…Â¸arÃƒâ€Ã‚Â±sÃƒâ€Ã‚Â±z! Bilgileri kontrol edip tekrar deneyin.");
    });
}

function kullaniciSil(id) {
    if (confirm("Bu kullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â±yÃƒâ€Ã‚Â± kalÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± olarak silmek istediÃƒâ€Ã…Â¸inize emin misiniz?")) {
        fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error("Silme iÃƒâ€¦Ã…Â¸lemi baÃƒâ€¦Ã…Â¸arÃƒâ€Ã‚Â±sÃƒâ€Ã‚Â±z.");
            alert("KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± silindi.");
            veritabanindanKullanicilariGetir();
        })
        .catch(error => alert("KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± silinirken hata oluÃƒâ€¦Ã…Â¸tu!"));
    }
}

// ==========================================
// 6. CÃƒâ€Ã‚Â°HAZ (TERMINAL) YÃƒÆ’Ã¢â‚¬â€œNETÃƒâ€Ã‚Â°MÃƒâ€Ã‚Â° MODÃƒÆ’Ã…â€œLÃƒÆ’Ã…â€œ
// ==========================================
function veritabanindanCihazlariGetir() {
    fetch(`${API_BASE}/api/devices`)
        .then(response => response.json())
        .then(data => {
            cihazlar = data;
            cihazTablosunuGuncelle();
            dashboardGuncelle();
            sensorCihazSecenekleriniGuncelle();
        })
        .catch(error => console.error("Cihazlar ÃƒÆ’Ã‚Â§ekilirken hata:", error));
}

function sensorCihazSecenekleriniGuncelle() {
    const select = document.getElementById('formSensorDeviceId');
    if (!select) return;

    const oncekiSecim = select.value;
    const kullanilabilirCihazlar = cihazlar.filter(c => c && c.deviceId != null);

    if (kullanilabilirCihazlar.length === 0) {
        select.innerHTML = '<option value="">Once cihaz ekleyin</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = kullanilabilirCihazlar.map(c => {
        const durum = c.aktifMi ? 'Aktif' : 'Pasif';
        const ad = c.cihazAdi || `Cihaz ${c.deviceId}`;
        return `<option value="${c.deviceId}">${escapeHtml(ad)} (#${c.deviceId} - ${durum})</option>`;
    }).join('');

    const varsayilan = kullanilabilirCihazlar.find(c => c.aktifMi) || kullanilabilirCihazlar[0];
    const secimGecerli = kullanilabilirCihazlar.some(c => String(c.deviceId) === oncekiSecim);
    select.value = secimGecerli ? oncekiSecim : String(varsayilan.deviceId);
}

function cihazTablosunuGuncelle() {
    const tbody = document.getElementById("cihazTablosuGovdesi");
    if(!tbody) return;
    tbody.innerHTML = ""; 

    cihazlar.forEach(c => {
        const durumMetni = c.aktifMi ? "Aktif" : "Pasif";
        const row = `<tr>
            <td>${c.deviceId}</td>
            <td>${escapeHtml(c.cihazAdi || '-')}</td>
            <td>${escapeHtml(c.konum || '-')}</td>
            <td>${escapeHtml(c.ipAdresi || '-')}</td>
            <td><span class="status-${durumMetni.toLowerCase()}">${durumMetni}</span></td>
            <td>
                <button class="edit-btn" onclick="cihazDuzenle(${c.deviceId})">DÃƒÆ’Ã‚Â¼zenle</button>
                <button class="delete-btn" onclick="cihazSil(${c.deviceId})">Sil</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function cihazModaliKapat() {
    cihazModal.style.display = 'none';
}

function yeniCihazEkle() {
    document.getElementById('cihazFormu').reset(); 
    document.getElementById('formCihazId').value = ''; 
    modalCihazBaslik.innerText = 'Yeni Terminal TanÃƒâ€Ã‚Â±mla';
    cihazModal.style.display = 'block';
}

function cihazDuzenle(id) {
    const cihaz = cihazlar.find(c => c.deviceId === id);
    if (cihaz) {
        document.getElementById('formCihazId').value = cihaz.deviceId;
        document.getElementById('formCihazAd').value = cihaz.cihazAdi || "";
        document.getElementById('formCihazKonum').value = cihaz.konum || "";
        document.getElementById('formCihazIp').value = cihaz.ipAdresi || "";
        document.getElementById('formCihazDurum').value = cihaz.aktifMi ? "Aktif" : "Pasif";

        modalCihazBaslik.innerText = 'Cihaz Bilgilerini GÃƒÆ’Ã‚Â¼ncelle';
        cihazModal.style.display = 'block';
    }
}

function cihazKaydet(event) {
    event.preventDefault();

    const idDegeri = document.getElementById('formCihazId').value;
    const gonderilecekCihaz = {
        ...(idDegeri && { deviceId: idDegeri }),
        cihazAdi: document.getElementById('formCihazAd').value,
        konum: document.getElementById('formCihazKonum').value,
        ipAdresi: document.getElementById('formCihazIp').value,
        cihazTipi: "Turnike/Kapi", 
        aktifMi: document.getElementById('formCihazDurum').value === 'Aktif'
    };

    const url = idDegeri ? `${API_BASE}/api/devices/${idDegeri}` : `${API_BASE}/api/devices`;
    const method = idDegeri ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gonderilecekCihaz)
    })
    .then(response => {
        if (!response.ok) throw new Error("Cihaz kaydedilemedi.");
        return response.json();
    })
    .then(() => {
        alert(idDegeri ? "Cihaz gÃƒÆ’Ã‚Â¼ncellendi!" : "Yeni cihaz eklendi!");
        cihazModaliKapat();
        veritabanindanCihazlariGetir();
    })
    .catch(error => console.error("HATA:", error));
}

function cihazSil(id) {
    if (confirm("Bu cihazÃƒâ€Ã‚Â± kalÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± olarak silmek istediÃƒâ€Ã…Â¸inize emin misiniz?")) {
        fetch(`${API_BASE}/api/devices/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error("Silme baÃƒâ€¦Ã…Â¸arÃƒâ€Ã‚Â±sÃƒâ€Ã‚Â±z.");
            alert("Cihaz baÃƒâ€¦Ã…Â¸arÃƒâ€Ã‚Â±yla silindi.");
            veritabanindanCihazlariGetir();
        })
        .catch(error => console.error("Hata:", error));
    }
}

// ==========================================
// 7. LOG (GEÃƒÆ’Ã¢â‚¬Â¡Ãƒâ€Ã‚Â°Ãƒâ€¦Ã‚Â KAYITLARI) MODÃƒÆ’Ã…â€œLÃƒÆ’Ã…â€œ
// ==========================================
function veritabanindanLoglariGetir() {
    fetch(`${API_BASE}/api/logs`)
        .then(response => {
            if (!response.ok) throw new Error("AÃƒâ€Ã…Â¸ hatasÃƒâ€Ã‚Â±: " + response.status);
            return response.json();
        })
        .then(data => {
            loglar = data;
            loglariGuncelle();
            dashboardGuncelle();
        })
        .catch(error => console.error("Loglar ÃƒÆ’Ã‚Â§ekilirken hata:", error));
}

function loglariGuncelle(gosterilecekLoglar = loglar) {
    const tbody = document.querySelector("#loglar tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    if (!gosterilecekLoglar || gosterilecekLoglar.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>KayÃƒâ€Ã‚Â±t bulunamadÃƒâ€Ã‚Â±.</td></tr>";
        return;
    }

    const siraliLoglar = [...gosterilecekLoglar];

    siraliLoglar.forEach(l => {
        const tarih = l.girisZamani ? new Date(l.girisZamani).toLocaleString('tr-TR') : '-';
        const cihazId = l.device ? l.device.deviceId : '-';
        const kullaniciId = l.user ? l.user.userId : 'KayÃƒâ€Ã‚Â±tsÃƒâ€Ã‚Â±z Kart';

        const row = `<tr>
            <td>${tarih}</td>
            <td>${cihazId}</td>
            <td>${kullaniciId}</td>
            <td>${escapeHtml(l.girisYontemi || '-')}</td>
            <td style="color: ${l.sonuc && l.sonuc.includes('ONAYLANDI') ? 'green' : (l.sonuc && l.sonuc.includes('KAYDEDILDI') ? '#0d47a1' : 'red')}; font-weight: bold;">
                ${escapeHtml(l.sonuc || '-')}
            </td>
            <td class="log-aciklama">${escapeHtml(l.aciklama || '-')}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function logFiltrele() {
    const arananKullaniciId = document.getElementById('filtreKullanici').value;
    const arananSonuc = document.getElementById('filtreSonuc').value;

    const filtrelenmisLoglar = loglar.filter(l => {
        let eslesiyorMu = true;
        if (arananKullaniciId && l.user && l.user.userId.toString() !== arananKullaniciId) eslesiyorMu = false;
        if (arananSonuc && l.sonuc && !l.sonuc.includes(arananSonuc)) eslesiyorMu = false;
        return eslesiyorMu;
    });
    loglariGuncelle(filtrelenmisLoglar);
}

function filtreyiTemizle() {
    document.getElementById('filtreKullanici').value = '';
    document.getElementById('filtreSonuc').value = '';
    loglariGuncelle(loglar); 
}

// ==========================================
// 8. GEÃƒÆ’Ã¢â‚¬Â¡Ãƒâ€Ã‚Â°Ãƒâ€¦Ã‚Â SÃƒâ€Ã‚Â°MÃƒÆ’Ã…â€œLASYONU (TEST) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 3 YÃƒÆ’Ã¢â‚¬â€œNTEM
// ==========================================

// Sekme geÃƒÆ’Ã‚Â§iÃƒâ€¦Ã…Â¸i
function simTabSec(tip) {
    // TÃƒÆ’Ã‚Â¼m panel ve sekmeleri pasif yap
    ['kart','no','fp'].forEach(t => {
        const panel = document.getElementById('simPanel' + t.charAt(0).toUpperCase() + t.slice(1));
        const tab   = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (panel) panel.style.display = 'none';
        if (tab)   tab.classList.remove('active');
    });
    // SeÃƒÆ’Ã‚Â§ilen sekmeyi aktif yap
    const aktifPanel = document.getElementById('simPanel' + tip.charAt(0).toUpperCase() + tip.slice(1));
    const aktifTab   = document.getElementById('tab'      + tip.charAt(0).toUpperCase() + tip.slice(1));
    if (aktifPanel) aktifPanel.style.display = 'block';
    if (aktifTab)   aktifTab.classList.add('active');

    // SonuÃƒÆ’Ã‚Â§ alanÃƒâ€Ã‚Â±nÃƒâ€Ã‚Â± temizle
    const sonucDiv = document.getElementById('simSonuc');
    if (sonucDiv) { sonucDiv.style.display = 'none'; sonucDiv.innerText = ''; }
}

function simulasyonCalistir(tip) {
    const sonucDiv = document.getElementById('simSonuc');
    let url = '';

    if (tip === 'kart') {
        const kartNo  = (document.getElementById('simKartNo') || {}).value.trim();
        const cihazId = parseInt((document.getElementById('simCihazIdKart') || {}).value || '0', 10);
        if (!kartNo || !cihazId || cihazId < 1) {
            alert("GeÃƒÆ’Ã‚Â§erli kart numarasÃƒâ€Ã‚Â± ve cihaz ID girin.");
            return;
        }
        url = `${API_BASE}/api/auth/kart-okut?kartNo=${encodeURIComponent(kartNo)}&deviceId=${cihazId}`;

    } else if (tip === 'no') {
        const okulNo  = (document.getElementById('simOkulNo') || {}).value.trim();
        const cihazId = parseInt((document.getElementById('simCihazIdNo') || {}).value || '0', 10);
        if (!okulNo || !cihazId || cihazId < 1) {
            alert("GeÃƒÆ’Ã‚Â§erli okul numarasÃƒâ€Ã‚Â± ve cihaz ID girin.");
            return;
        }
        url = `${API_BASE}/api/auth/numara-okut?ogrenciNo=${encodeURIComponent(okulNo)}&deviceId=${cihazId}`;

    } else if (tip === 'fp') {
        const fpSlot  = (document.getElementById('simFPSlot') || {}).value.trim();
        const cihazId = parseInt((document.getElementById('simCihazIdFP') || {}).value || '0', 10);
        if (!fpSlot || !cihazId || cihazId < 1) {
            alert("GeÃƒÆ’Ã‚Â§erli parmak izi slot numarasÃƒâ€Ã‚Â± ve cihaz ID girin.");
            return;
        }
        url = `${API_BASE}/api/auth/parmak-izi-okut?parmakIzi=${encodeURIComponent(fpSlot)}&deviceId=${cihazId}`;

    } else {
        alert("Bilinmeyen test tipi.");
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error("Sunucuya ulaÃƒâ€¦Ã…Â¸Ãƒâ€Ã‚Â±lamadÃƒâ€Ã‚Â±!");
        return response.text(); 
    })
    .then(yanit => {
        sonucDiv.style.display = "block";
        sonucDiv.innerText = yanit; 
        
        if (yanit === "ONAYLANDI") {
            sonucDiv.className = "sim-result result-approved";
        } else {
            sonucDiv.className = "sim-result result-denied";
        }
        
        veritabanindanLoglariGetir(); 
    })
    .catch(error => {
        console.error("HATA:", error);
        sonucDiv.style.display = "block";
        sonucDiv.innerText = "SÃƒâ€Ã‚Â°STEM HATASI!";
        sonucDiv.className = "sim-result result-denied";
    });
}

// ==========================================
// 9. CANLI SENSOR YAKALAMA (GERCEK API POLLING)
// ==========================================

let _sensorTimerId = null;
let _sensorTargetField = null;
let _sensorBtnId = null;
let _sensorRemaining = 30;
let _sensorTickId = null;
let _sensorPollId = null;
let _sensorSessionId = null;

const SENSOR_TIMEOUT_MS = 30000;
const SENSOR_POLL_MS = 1000;

function sensorOturumBaslat(type, targetField, btnId) {
    sensorTemizle(false);

    const deviceSelect = document.getElementById('formSensorDeviceId');
    const deviceId = parseInt((deviceSelect || {}).value || '0', 10);
    if (!deviceId) {
        alert('Canli sensor okumadan once aktif bir cihaz secin.');
        return;
    }

    _sensorTargetField = targetField;
    _sensorBtnId = btnId;

    const isKart = type === 'CARD';
    const isFP = type === 'FINGERPRINT';
    document.getElementById('sensorIconBig').textContent = isKart ? 'RF' : (isFP ? 'FP' : 'NO');
    document.getElementById('sensorModalBaslik').textContent = isKart ? 'Kart sensoru aktif' : (isFP ? 'Parmak sensoru aktif' : 'Sensor aktif');
    document.getElementById('sensorModalAciklama').textContent = `Cihaz #${deviceId} uzerinden veri bekleniyor...`;
    _sensorRemaining = SENSOR_TIMEOUT_MS / 1000;
    _guncelleCountdown();

    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('sensor-aktif');

    document.getElementById('sensorModal').style.display = 'block';

    const fill = document.getElementById('sensorTimerFill');
    if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '100%';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fill.style.transition = `width ${SENSOR_TIMEOUT_MS}ms linear`;
                fill.style.width = '0%';
            });
        });
    }

    _sensorTickId = setInterval(() => {
        _sensorRemaining--;
        _guncelleCountdown();
    }, 1000);

    fetch(`${API_BASE}/api/sensor/start?type=${encodeURIComponent(type)}&deviceId=${deviceId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) throw new Error('Sensor oturumu baslatilamadi.');
        return response.json();
    })
    .then(data => {
        if (!data.sessionId) throw new Error('Sunucu oturum kimligi dondurmedi.');
        _sensorSessionId = data.sessionId;
        _sensorPollId = setInterval(() => sensorSonucuYokla(), SENSOR_POLL_MS);
        _sensorTimerId = setTimeout(() => {
            alert('Sensor okumasi zaman asimina ugradi.');
            sensorTemizle(true);
        }, SENSOR_TIMEOUT_MS);
    })
    .catch(error => {
        console.error('Sensor oturumu hatasi:', error);
        alert('Canli sensor oturumu baslatilamadi.');
        sensorTemizle(true);
    });
}

function sensorSonucuYokla() {
    if (!_sensorSessionId) return;

    fetch(`${API_BASE}/api/sensor/result?sessionId=${encodeURIComponent(_sensorSessionId)}`)
        .then(response => {
            if (!response.ok) throw new Error('Sensor sonucu alinamadi.');
            return response.json();
        })
        .then(data => {
            if (data.status !== 'READY') return;

            const inp = document.getElementById(_sensorTargetField);
            if (inp) {
                inp.value = data.value || '';
                inp.style.background = '#dcfce7';
                setTimeout(() => { inp.style.background = ''; }, 1500);
            }

            sensorTemizle(true);
        })
        .catch(error => {
            console.error('Sensor polling hatasi:', error);
            sensorTemizle(true);
        });
}

function _guncelleCountdown() {
    const el = document.getElementById('sensorCountdown');
    if (el) el.textContent = `${_sensorRemaining} sn kaldi`;
}

function sensorIptal() {
    sensorTemizle(true);
}

function sensorTemizle(closeModal) {
    clearTimeout(_sensorTimerId);
    clearInterval(_sensorTickId);
    clearInterval(_sensorPollId);
    _sensorTimerId = null;
    _sensorTickId = null;
    _sensorPollId = null;

    if (_sensorBtnId) {
        const btn = document.getElementById(_sensorBtnId);
        if (btn) btn.classList.remove('sensor-aktif');
    }

    if (_sensorSessionId) {
        fetch(`${API_BASE}/api/sensor/session?sessionId=${encodeURIComponent(_sensorSessionId)}`, {
            method: 'DELETE'
        }).catch(error => console.error('Sensor oturumu temizlenemedi:', error));
    }

    _sensorBtnId = null;
    _sensorTargetField = null;
    _sensorSessionId = null;

    const fill = document.getElementById('sensorTimerFill');
    if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '100%';
    }

    if (closeModal) {
        document.getElementById('sensorModal').style.display = 'none';
    }
}
