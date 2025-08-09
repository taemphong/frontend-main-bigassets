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
                          <strong>ทรัพย์สิน:</strong>
                          {{ track.asset_name || "ไม่ทราบชื่อ" }}<br />
                          <strong>ที่อยู่:</strong> {{ track.manual_address
                          }}<br />
                          <a
                            :href="track.map_url"
                            target="_blank"
                            rel="noopener"
                            >🌐 เปิดใน Google Maps</a
                          >
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
import axios from "axios";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";

// Bangkok default center
const defaultLat = 13.7563;
const defaultLng = 100.5018;

const mapReady = ref(false);
const trackings = ref([]);

// ✅ โหลดข้อมูลจาก API จริง
onMounted(async () => {
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getLocation"
    );
    if (res.data.status === "success") {
      console.log("ข้อมูลติดตามทรัพย์สิน:", res.data.data);
      trackings.value = res.data.data
  .filter(
    (item) =>
      item.latitude &&
      item.longitude &&
      !isNaN(parseFloat(item.latitude)) &&
      !isNaN(parseFloat(item.longitude))
  )
  .map((item, index) => ({
    tracking_id: index + 1,
    asset_id: item.asset_id,
    asset_name: item.asset_name,
    latitude: parseFloat(item.latitude),
    longitude: parseFloat(item.longitude),
    map_url: item.map_url,
    manual_address: item.manual_address,
    captured_at: new Date().toISOString(),
  }));
    }
    mapReady.value = true;
  } catch (err) {
    console.error("โหลดแผนที่ล้มเหลว:", err);
  }
});
</script>
