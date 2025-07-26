<template>
  <Layout>
    <h1>ติดตามทรัพย์สิน</h1>
    <v-row>
      <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
        <v-container fluid>
          <v-row class="mt-5">
            <v-col cols="12">
              <v-card class="pa-4">
                <v-card-title>แผนที่ติดตามทรัพย์สิน</v-card-title>
                <v-card-text>
                  <l-map
                    v-if="mapReady"
                    :zoom="11"
                    :center="[defaultLat, defaultLng]"
                    style="height: 600px; width: 100%"
                  >
                    <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <l-marker
                      v-for="track in trackings"
                      :key="track.tracking_id"
                      :lat-lng="[track.latitude, track.longitude]"
                    >
                      <l-popup>
                        <div>
                          <strong>ทรัพย์สิน:</strong> {{ track.asset_id }}<br />
                          <strong>คำอธิบาย:</strong>
                          {{ track.location_description }}<br />
                          <strong>เวลาที่บันทึก:</strong>
                          {{ formatDate(track.captured_at) }}<br />
                          <a
                            :href="track.map_url"
                            target="_blank"
                            rel="noopener"
                          >
                            🌐 เปิดใน Google Maps
                          </a>
                        </div>
                      </l-popup>
                    </l-marker>
                  </l-map>
                  <v-alert v-else type="info" class="mt-4">
                    กำลังโหลดแผนที่...
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { ref, onMounted } from "vue";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";

// Bangkok default center
const defaultLat = 13.7563;
const defaultLng = 100.5018;

const mapReady = ref(false);
const trackings = ref([]);

// ✅ ฟอร์แมตวันที่ให้อ่านง่าย
const formatDate = (date) => {
  return new Date(date).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ✅ mock data จำลอง asset_tracking
onMounted(() => {
  trackings.value = [
    {
      tracking_id: 1,
      asset_id: 1001,
      customer_borrowrequest_id: 501,
      map_url: "https://maps.google.com/?q=13.7563,100.5018",
      latitude: 13.7563,
      longitude: 100.5018,
      location_description: "หน้าร้าน BAKE56 สาขาบางแค",
      captured_at: "2025-07-24T09:30:00Z",
    },
    {
      tracking_id: 2,
      asset_id: 1002,
      customer_borrowrequest_id: 502,
      map_url: "https://maps.google.com/?q=13.7456,100.5398",
      latitude: 13.7456,
      longitude: 100.5398,
      location_description: "ลูกค้ารับของที่พระราม 3",
      captured_at: "2025-07-24T10:00:00Z",
    },
    {
      tracking_id: 3,
      asset_id: 1003,
      customer_borrowrequest_id: 503,
      map_url: "https://maps.google.com/?q=13.7891,100.6078",
      latitude: 13.7891,
      longitude: 100.6078,
      location_description: "ส่งของที่สุขุมวิท 103",
      captured_at: "2025-07-24T10:45:00Z",
    },
  ];
  mapReady.value = true;
});
</script>
