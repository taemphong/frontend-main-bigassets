<template>
  <Layout>
    <h1>บัญชีทรัพย์สิน</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="11" class="mx-auto mt-5">
          <v-card flat>
            <v-card-title class="d-flex align-center pe-2">
              รายงานบัญชีทรัพย์สิน
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                density="compact"
                label="ค้นหา"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
              ></v-text-field>
            </v-card-title>

            <v-divider></v-divider>

            <v-data-table
              v-model:search="search"
              :headers="headers"
              :items="items"
              class="elevation-1"
            >
              <template v-slot:[`item.purchase_price`]="{ item }">
                {{ item.purchase_price?.toLocaleString() }} บาท
              </template>
              <template v-slot:[`item.annual_depreciation`]="{ item }">
                {{ item.annual_depreciation?.toLocaleString() || '-' }} บาท
              </template>
              <template v-slot:[`item.net_value`]="{ item }">
                <span style="color: #2196f3; font-weight:bold;">
                  {{ item.net_value?.toLocaleString() || '-' }} บาท
                </span>
              </template>
              <template v-slot:[`item.salvage_value`]="{ item }">
                {{ item.salvage_value?.toLocaleString() || '-' }} บาท
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex justify-center" style="gap: 8px">
                  <v-btn
                    variant="tonal"
                    color="warning"
                    @click="DepreciationAsset(item)"
                  >
                    <v-icon>mdi-calculator</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAssetStore } from "@/stores/assetStore";

const router = useRouter();
const assetStore = useAssetStore();
const search = ref("");
const items = ref([]);

const headers = [
  { title: "รหัสทรัพย์สิน", value: "asset_code", align: "center" },
  { title: "ชื่อทรัพย์สิน", value: "asset_name", align: "center" },
  { title: "ราคาซื้อ", value: "purchase_price", align: "center" },
  { title: "ค่าเสื่อม/ปี", value: "annual_depreciation", align: "center" },
  { title: "มูลค่าปัจจุบัน", value: "net_value", align: "center" },
  { title: "อายุใช้งาน", value: "useful_life", align: "center" },
  { title: "วันซื้อ", value: "purchase_date", align: "center" },
  { title: "มูลค่าซาก", value: "salvage_value", align: "center" },
  { title: "คำนวณ", value: "actions", sortable: false, align: "center" },
];

const fetchAssets = async () => {
  try {
    const response = await axios.post("http://localhost:4512/api/asset/getasset");
    if (response.data.status === "success") {
      items.value = response.data.result;
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดบัญชีทรัพย์สิน:", error);
  }
};

onMounted(fetchAssets);

// ✅ ฟังก์ชันคำนวณค่าเสื่อม
const DepreciationAsset = (item) => {
  assetStore.setSelectedAsset(item);
  console.log("ส่งไปคำนวณ:", item);
  router.push("/depreciation");
};
</script>

<style scoped>
.v-data-table {
  font-size: 14px;
}
</style>
