<template>
  <div class="fullscreen-scanner">
    <div class="scanner-overlay">
      <p class="header-text">กรุณาสแกน QR Code ของทรัพย์สิน</p>

      <div class="scanner-frame"></div>
    </div>

    <!-- html5-qrcode จะแสดง video อยู่ในนี้ -->
    <div id="qr-reader" class="qr-video-container"></div>
  </div>
</template>

<style scoped>
.fullscreen-scanner {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: black;
}

.qr-video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Overlay content */
.scanner-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 2rem;
  background: rgba(0, 0, 0, 0.3); /* optional dark overlay */
}

.header-text {
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
}

.scanner-frame {
  width: 80vw;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  border: 3px solid white;
  border-radius: 8px;
  box-sizing: border-box;
  margin-bottom: 1.5rem;
}


</style>
