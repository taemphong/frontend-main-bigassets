<template>
  <!-- พื้นที่กล้องเต็มจอ -->
  <div id="reader" class="scanner"></div>

  <!-- ตัวรับสแกนไฟล์ (ต้องมี element จริงใน DOM) -->
  <div
    id="file-reader"
    style="position: absolute; width: 0; height: 0; overflow: hidden"
  ></div>

  <!-- ปุ่มลอย: อัปโหลดรูปเพื่อสแกนจากไฟล์ -->
  <button class="fab" @click="pickImage" title="สแกนจากรูปภาพ">
    <v-icon size="40">mdi-image</v-icon>
  </button>
  <input
    ref="fileInputRef"
    type="file"
    accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
    capture="environment"
    class="hidden-input"
    @change="onFileChange"
  />

  <!-- ปุ่มย้อนกลับ -->
  <button class="back-btn" @click="goHome">ย้อนกลับ</button>

  <!-- แจ้งผลลัพธ์ / ข้อผิดพลาด -->
  <p v-if="result" class="toast ok">{{ result }}</p>
  <p v-if="errorMsg" class="toast err">{{ errorMsg }}</p>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "vue-router";
const router = useRouter();

function goHome() {
  router.push("/home");
}

const result = ref("");
const errorMsg = ref("");
const fileInputRef = ref(null);

let cameraScanner = null;
let fileScanner = null;
let cameraStarted = false;
let restartTimer = null;
let navigated = false; // กันเปลี่ยนหน้าซ้ำ

function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// ✅ ฟังก์ชันกลาง ส่งผลลัพธ์ไปหน้า /check-asset
function handleSuccess(text) {
  if (!text || navigated) return;
  navigated = true;
  result.value = text;
  router.push({ path: "/check-asset", query: { asset_code: text } }).finally(() => {
    try { cameraScanner.stop(); } catch { console.log("checkerr")}
    cameraStarted = false;
  });
}

async function startCamera() {
  try {
    if (cameraStarted) {
      try { await cameraScanner.stop(); } catch { console.log("checkerr")}
    }
    const aspect = window.innerWidth / window.innerHeight;

    await cameraScanner.start(
      { facingMode: "environment" },
      {
        fps: 12,
        aspectRatio: aspect,
        qrbox: (vw, vh) => {
          const base = Math.min(vw, vh) * 0.58;
          const size = Math.max(220, Math.min(base, 340));
          return { width: size, height: size };
        },
        disableFlip: true,
      },
      (decodedText) => handleSuccess(decodedText),
      () => {}
    );
    cameraStarted = true;
    errorMsg.value = "";
  } catch (e) {
    errorMsg.value = "ไม่สามารถเปิดกล้องได้";
    console.error("startCamera error:", e);
  }
}

function scheduleRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => startCamera(), 300);
}

/* --------- สแกนจากรูปภาพ --------- */
function pickImage() {
  errorMsg.value = "";
  fileInputRef.value?.click();
}

async function onFileChange(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  let paused = false;
  try {
    if (cameraStarted) {
      try {
        cameraScanner.pause(true);
        paused = true;
      } catch { console.log("checkerr")}
    }
    const text = await fileScanner.scanFile(file, false);
    errorMsg.value = "";
    handleSuccess(text); // ✅ ใช้ฟังก์ชันกลาง
    return; // ไม่ต้อง resume กล้องเพราะเปลี่ยนหน้าแล้ว
  } catch (err) {
    errorMsg.value = "ไม่พบ QR ในรูปที่เลือก";
    console.warn("scanFile error:", err);
  } finally {
    if (!navigated && paused) {
      try {
        cameraScanner.resume();
      } catch {
        scheduleRestart();
      }
    } else if (!navigated && !cameraStarted) {
      scheduleRestart();
    }
  }
}
/* ---------------------------------- */

onMounted(async () => {
  setVh();
  window.addEventListener("resize", setVh);
  window.addEventListener("orientationchange", setVh);
  window.addEventListener("resize", scheduleRestart);
  window.addEventListener("orientationchange", scheduleRestart);

  cameraScanner = new Html5Qrcode("reader");
  fileScanner = new Html5Qrcode("file-reader");

  await startCamera();
});

onBeforeUnmount(async () => {
  window.removeEventListener("resize", setVh);
  window.removeEventListener("orientationchange", setVh);
  window.removeEventListener("resize", scheduleRestart);
  window.removeEventListener("orientationchange", scheduleRestart);
  try { if (cameraScanner) await cameraScanner.stop(); } catch { console.log("checkerr")}
  try { if (cameraScanner) await cameraScanner.clear(); } catch { console.log("checkerr")}
  try { if (fileScanner) await fileScanner.clear(); } catch { console.log("checkerr")}
});
</script>

<style>
/* เต็มจอจริงบนมือถือ */
:global(html, body, #app) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.scanner {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100); /* แก้ 100vh bug มือถือ */
  background: #000;
}

/* บังคับ video/canvas ให้คลุมเต็มพื้นที่ */
.scanner video,
.scanner canvas {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* ปุ่มลอยอัปโหลดรูป */
.fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: auto; /* ไม่บังคับกล่องวงกลม */
  height: auto;
  border: none;
  background: transparent; /* พื้นหลังโปร่งใส */
  color: #fff; /* สีไอคอน */
  font-size: 32px; /* ขยายไอคอนให้ใหญ่ขึ้นถ้าต้องการ */
  cursor: pointer;
  padding: 0;
}
.fab:active {
  transform: scale(0.95);
}

.hidden-input {
  display: none;
}

/* Toast แสดงผล */
.toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  max-width: 92vw;
  text-align: center;
}
.toast.ok {
  bottom: 72px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.toast.err {
  bottom: 24px;
  background: rgba(220, 38, 38, 0.9);
}

.back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  z-index: 9999;
}
.back-btn:active {
  transform: scale(0.95);
}
</style>
