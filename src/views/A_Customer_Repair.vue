<template>
  <Layout>
    <h1 class="text-center my-6">รายการซ่อมที่รอดำเนินการ</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="10" class="mx-auto mt-5">
          <v-card class="pa-4 elevation-2 rounded-lg">
            <v-data-table
              :headers="headers"
              :items="repairsInProgress"
              :loading="loading"
              loading-text="กำลังโหลดข้อมูล..."
              class="elevation-1"
            >
              <!-- ไม่มีข้อมูล -->
              <template v-slot:no-data>
                <div class="text-center pa-8 text-grey">
                  <v-icon size="48" color="grey">mdi-wrench</v-icon>
                  <p class="mt-2">ยังไม่มีรายการซ่อมที่รอดำเนินการ</p>
                </div>
              </template>

              <!-- ชื่อลูกค้า -->
              <template v-slot:[`item.customer_name`]="{ item }">
                {{ item.customer_firstname }} {{ item.customer_lastname }}
              </template>

              <!-- วันที่แจ้งซ่อม -->
              <template v-slot:[`item.repair_report_date`]="{ item }">
                {{ formatDate(item.repair_report_date) }}
              </template>

              <!-- นัดซ่อม -->
              <template v-slot:[`item.appointment_date`]="{ item }">
                {{ formatDate(item.appointment_date) }}
              </template>

              <!-- ค่าใช้จ่ายรวม -->
              <template v-slot:[`item.total_cost`]="{ item }">
                {{ Number(item.total_cost).toLocaleString() }} ฿
              </template>

              <!-- สถานะ -->
              <template v-slot:[`item.repair_status`]="{ item }">
                <v-chip color="orange" dark>{{ item.repair_status }}</v-chip>
              </template>

              <!-- การจัดการ -->
               
              <template v-slot:[`item.actions`]="{ item }">
                 <div class="d-flex justify-center" style="gap: 8px">
                <v-btn
                  color="success"
                  size="small"
                  @click="markAsCompleted(item)"
                >
                  บันทึกซ่อมเสร็จ
                </v-btn>
                </div>
              </template>

              <!-- Footer รวมยอด -->
              <template v-slot:bottom>
                <div class="text-right mt-4 mr-4 font-weight-bold">
                  รวมยอดค่าใช้จ่ายทั้งหมด:
                  {{ sumTotalCost(repairsInProgress) }} ฿
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
import { ref, onMounted } from "vue";
import axios from "axios";
import Layout from "@/components/AssetsLayout.vue";

// STATE
const repairsInProgress = ref([]);
const loading = ref(true);

// ตาราง
const headers = [
  { title: "รหัสซ่อม", key: "repair_id" },
  { title: "ทรัพย์สิน", key: "asset_name" },
  { title: "ลูกค้า", key: "customer_name" },
  { title: "วันที่แจ้ง", key: "repair_report_date" },
  { title: "นัดซ่อม", key: "appointment_date" },
  { title: "หมายเหตุ", key: "repair_note" },
  { title: "รวมค่าใช้จ่าย", key: "total_cost" },
  { title: "สถานะ", key: "repair_status", align: "center" },
  { title: "การจัดการ", key: "actions", sortable: false, align:"center" },
];

// โหลดข้อมูล
const fetchRepairs = async () => {
  loading.value = true;
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getRepairInProgress"
    );
    repairsInProgress.value = res.data.data || [];
  } catch (err) {
    console.error("โหลดข้อมูลล้มเหลว:", err);
  } finally {
    loading.value = false;
  }
};

// บันทึกซ่อมเสร็จ
const markAsCompleted = async (item) => {

  console.log(item)
  
};

// Format วันที่
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// รวมยอด
const sumTotalCost = (items) => {
  return items
    .reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0)
    .toLocaleString();
};

onMounted(() => {
  fetchRepairs();
});
</script>
