<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto">
          <h1 class="text-center">ตรวจสอบทรัพย์สิน</h1>
          <v-alert
            v-if="!assetId"
            type="warning"
            variant="tonal"
            class="mt-4"
            title="ไม่พบรหัสทรัพย์สินที่ส่งมา"
            text="กรุณากลับไปสแกน QR อีกครั้ง"
          />
          <!-- Error -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            :title="'เกิดข้อผิดพลาด'"
            :text="errorMessage"
          />
          <!-- Loading -->
          <v-skeleton-loader
            v-if="loading"
            class="mt-6"
            type="card, list-item-two-line, list-item-two-line"
          />
          <!-- Empty -->
          <v-empty-state
            v-else-if="assetId && !errorMessage && !item"
            class="mt-8"
            icon="mdi-database-search"
            title="ไม่พบข้อมูลทรัพย์สิน"
            text="ตรวจสอบรหัสอีกครั้ง หรือสแกนใหม่"
          >
            <template #actions>
              <v-btn
                color="primary"
                prepend-icon="mdi-qrcode-scan"
                @click="goScan"
              >
                สแกนใหม่
              </v-btn>
            </template>
          </v-empty-state>

          <!-- Details Card -->
          <v-card v-else class="mt-6 rounded-xl" elevation="2">
            <v-card-item>
              <div
                class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between ga-3"
              >
                <div class="d-flex flex-column">
                  <h4>
                    {{ item?.asset_name || "—" }}
                  </h4>
                  <h4>
                    {{
                      (item?.brand || "—") +
                      (item?.model ? " · " + item.model : "")
                    }}
                  </h4>
                </div>
              </div>
            </v-card-item>

            <v-divider />

            <!-- Key-Value Grid -->
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <p>รหัสทรัพย์สิน</p>
                  <p>
                    {{ item?.asset_code || "—" }}
                  </p>
                </v-col>

                <v-col cols="12" sm="6">
                  <p>ชื่อทรัพย์สิน</p>
                  <p>
                    {{ item?.asset_name || "—" }}
                  </p>
                </v-col>

                <v-col cols="12" sm="6">
                  <p>ยี่ห้อ</p>
                  <p>
                    {{ item?.brand || "—" }}
                  </p>
                </v-col>

                <v-col cols="12" sm="6">
                  <p>รุ่น</p>
                  <p>
                    {{ item?.model || "—" }}
                  </p>
                </v-col>

                <v-col cols="12" sm="6">
                  <p>สถานที่</p>
                  <p>
                    {{ item?.location_name || "—" }}
                  </p>
                </v-col>
                <v-col cols="12">
                  <v-divider class="my-2" />
                </v-col>

                <v-col cols="12" sm="6">
                  <p>ผู้รับผิดชอบ</p>
                  <div class="text-body-1 font-weight-medium">
                    {{ item?.owner_name || "—" }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <p>วันที่รับเข้า</p>
                  <div class="text-body-1 font-weight-medium">
                    {{ formatThaiDate(item?.received_at) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="d-flex justify-end ga-2">
              <v-btn
                variant="text"
                prepend-icon="mdi-arrow-left"
                @click="goScan"
              >
                กลับไปสแกน
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Layout from "@/components/AssetsLayout.vue";

const route = useRoute();
const router = useRouter();

const items = ref([]);
const loading = ref(false);
const errorMessage = ref("");

// รองรับทั้ง asset_code และ asset_id เผื่อกรณีส่งพารามิเตอร์ต่างชื่อ
const assetId = computed(() => {
  const q = route.query;
  return (q.asset_code ?? q.asset_id ?? "").toString().trim();
});

const item = computed(() => items.value?.[0] ?? null);

function formatThaiDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  // แสดง พ.ศ. และเวลาแบบย่อ
  const th = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return th.format(d);
}

async function fetchAsset() {
  if (!assetId.value) return;
  loading.value = true;
  errorMessage.value = "";
  try {
    const url = `http://localhost:4512/api/asset/assets/${encodeURIComponent(
      assetId.value
    )}`;
    const { data } = await axios.get(url);
    if (data?.success) {
      items.value = data.item ? [data.item] : [];
    } else {
      throw new Error(data?.message || "โหลดข้อมูลล้มเหลว");
    }
  } catch (e) {
    console.error(e);
    errorMessage.value = e?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function goScan() {
  router.push("/qr-scan");
}

// โหลดเมื่อเข้าเพจ และเมื่อ assetId เปลี่ยน
onMounted(() => {
  if (assetId.value) fetchAsset();
});
watch(assetId, (nv, ov) => {
  if (nv && nv !== ov) fetchAsset();
});
</script>
