<template>
  <Layout>
    <h1>จัดการทรัพย์สิน</h1>
    <p>รายการทรัพย์สิน > แสดงทั้งหมด</p>

    <v-container>
      <!-- ปุ่ม filter -->
      <v-btn-toggle v-model="statusFilter" rounded="xl" class="mb-4">
        <v-btn value="">แสดงทั้งหมด</v-btn>
        <v-btn value="ใช้งานปกติ" color="success">ใช้งานปกติ</v-btn>
        <v-btn value="แจ้งซ่อมบำรุง" color="warning">แจ้งซ่อมบำรุง</v-btn>
        <v-btn value="เลิกใช้งาน" color="error">เลิกใช้งาน</v-btn>
        <v-btn value="ถูกเบิกออก" color="info">เบิกออก</v-btn>
      </v-btn-toggle>

      <v-row>
        <v-col cols="12" md="8" lg="11" class="mx-auto mt-5">
          <v-card flat>
            <v-card-title class="d-flex align-center pe-2">
              จัดการรายการทรัพย์สิน
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
              v-model="selected"
              v-model:search="search"
              :headers="headers"
              :items="filteredItems"
              show-select
              item-value="asset_id"
              class="elevation-1"
            >
              <template v-slot:[`item.image_url`]="{ item }">
                <v-card class="my-2" elevation="2" rounded>
                  <v-img
                    :src="getImageUrl(item.image_url)"
                    height="64"
                    cover
                  ></v-img>
                </v-card>
              </template>

              <template v-slot:[`item.annual_depreciation`]="{ item }">
                <span>{{
                  (item.annual_depreciation ?? 0).toLocaleString()
                }}</span>
              </template>

              <template v-slot:[`item.status_name`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status_name)"
                  class="text-uppercase"
                  size="small"
                  label
                >
                  {{ item.status_name }}
                </v-chip>
              </template>
              <template v-slot:[`item.borrower_name`]="{ item }">
                <span v-if="item.borrower_firstname">
                  {{ item.borrower_firstname }} {{ item.borrower_lastname }}
                </span>
                <v-chip v-else color="grey" size="small"
                  >ยังไม่มี</v-chip
                >
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex justify-center" style="gap: 8px">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    @click="viewAsset(item)"
                  >
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    color="red"
                    @click="doTransaction(item)"
                  >
                    ทำธุรกรรม
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
          <v-row class="mt-5">
            <v-col class="d-flex justify-end">
              <v-btn
                prepend-icon="mdi-qrcode"
                color="red"
                @click="handleSelectedAssets"
              >
                Export
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useAssetStore } from "@/stores/assetStore";

const router = useRouter();
const assetStore = useAssetStore();

console.log("assetStore:", assetStore.selectedAsset);

const search = ref("");
const statusFilter = ref("");
const items = ref([]);

const headers = [
  { title: "ภาพ", value: "image_url", align: "center" },
  { title: "รหัสทรัพย์สิน", value: "asset_code", align: "center" },
  { title: "ประเภททรัพย์สิน", value: "type_name", align: "center" },
  { title: "ชื่อทรัพย์สิน", value: "asset_name", align: "center" },
  { title: "แบรนด์", value: "brand", align: "center" },
  { title: "รุ่น", value: "model", align: "center" },
  { title: "สถานะ", value: "status_name", align: "center" },
  { title: "ผู้ถือครองล่าสุด", value: "borrower_name", align: "center" },
  { title: "จัดการ", value: "actions", sortable: false, align: "center" },
];

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/defaultImage.png"; 
  return `http://localhost:4512/${imagePath.replaceAll("\\", "/")}`;
};

const getStatusColor = (status) => {
  if (status === "ใช้งานปกติ") return "green";
  if (status === "พักการใช้งาน") return "orange";
  if (status === "เลิกใช้งานแล้ว") return "red";
  if (status === "รอซ่อม") return "yellow";
  if (status === "รออนุมัติ") return "blue-grey";
  if (status === "ถูกเบิกออก") return "purple";
  if (status === "รออนุมัติยืม") return "indigo lighten-2";
  if (status === "แจ้งซ่อมบำรุง") return "brown";
  return "blue";
};

// กรองตามสถานะ
const filteredItems = computed(() => {
  if (!statusFilter.value) return items.value;
  return items.value.filter((item) => item.status_name === statusFilter.value);
});

const fetchAssets = async () => {
  try {
    const response = await axios.post(
      "http://localhost:4512/api/asset/getasset"
    );
    if (response.data.status === "success") {
      items.value = response.data.result;
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลทรัพย์สิน:", error);
  }
};

onMounted(fetchAssets);

//ไดอาล็อครายละเอียดทรัพย์สิน
const dialogassetDetail = ref(false);
const selectedAsset = ref(null);

const viewAsset = (item) => {
  selectedAsset.value = item;
  dialogassetDetail.value = true;
  console.log("asset_id:", item.asset_id);
};

//qrcode
const selected = ref([]);

const handleSelectedAssets = async () => {
  if (selected.value.length === 0) {
    await Swal.fire({
      icon: "warning",
      title: "กรุณาเลือกทรัพย์สิน",
      text: "คุณต้องเลือกอย่างน้อย 1 รายการเพื่อ export QR Code",
      confirmButtonText: "รับทราบ",
    });
    return;
  }

  const assetIds = selected.value.join(",");
  console.log("เลือก asset_id:", assetIds);

  try {
    const response = await axios.get(
      `http://localhost:4512/api/export/exportqrcode?ids=${assetIds}`,
      {
        responseType: "blob",
      }
    );

    const fileURL = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    window.open(fileURL);
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถโหลด PDF ได้ กรุณาลองใหม่",
      confirmButtonText: "ตกลง",
    });
  }
};

//ทำธุรกรรมเบิก/โอน/คืน
const doTransaction = (item) => {
  Swal.fire({
    title: `เลือกประเภทธุรกรรมสำหรับ<br>${item.asset_name}`,
    input: "select",
    inputOptions: {
      borrow: "เบิก",
      transfer: "โอน",
      return: "คืน",
      borrow_customer: "ยืมให้ลูกค้า",
      maintenance: "แจ้งซ่อมบำรุง",
    },
    inputPlaceholder: "เลือกประเภทธุรกรรม",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#66FF66",
    cancelButtonColor: "#FF3333",
  }).then((result) => {
    if (result.isConfirmed) {
      assetStore.setSelectedAsset(item);

      switch (result.value) {
        case "borrow":
          router.push({ path: "/borrowasset" });
          break;
        case "transfer":
          router.push({ path: "/transferasset" });
          break;
        case "return":
          router.push({ path: "/returnasset" });
          break;
        case "borrow_customer":
          router.push({ path: "/customer_request" });
          break;
        case "maintenance":
          router.push({ path: "/reportmaintenance" });
          break;
        default:
          break;
      }
    }
  });
};
</script>

<style scoped>
.v-data-table {
  font-size: 14px;
}
</style>
