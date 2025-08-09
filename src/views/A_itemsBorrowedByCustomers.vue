<template>
  <Layout>
    <h1 class="text-center my-6">รายการทรัพย์สินให้ลูกค้ายืม</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="11" class="mx-auto mt-5">
          <v-data-table
            :headers="headers"
            :items="borrowItems"
            :loading="loading"
            loading-text="กำลังโหลดข้อมูล..."
            class="elevation-1"
          >
            <!-- ชื่อเต็มลูกค้า -->
            <template v-slot:[`item.customer_name`]="{ item }">
              {{ item.customer_firstname }} {{ item.customer_lastname }}
            </template>

            <!-- สถานะ -->
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" dark>
                {{ item.status }}
              </v-chip>
            </template>
            <template v-slot:[`item.documents`]="{ item }">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="primary" size="small">
                    เอกสาร
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-if="item.slip_url"
                    :href="fileUrl(item.slip_url)"
                    target="_blank"
                    link
                  >
                    <v-list-item-title>หลักฐานมัดจำ</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="item.customer_id_card"
                    :href="fileUrl(item.customer_id_card)"
                    target="_blank"
                    link
                  >
                    <v-list-item-title>สำเนาบัตรประชาชน</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex justify-center" style="gap: 8px">
                <v-btn
                color="success"
                size="small"
                @click="detail(item)"
              >
                รายละเอียดรับประกัน
              </v-btn>
              <v-btn
                color="warning"
                size="small"
                @click="openRepairDialog(item)"
              >
                แจ้งซ่อม
              </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <!-- แจ้งซ่อม -->
      <v-dialog v-model="repairDialog" max-width="600">
        <v-card>
          <v-card-title>แจ้งซ่อม: {{ selectedItem?.asset_name }}</v-card-title>
          <v-card-text>
            <v-form ref="repairForm" lazy-validation>
              <v-text-field
                v-model="repairData.repair_report_date"
                label="วันที่แจ้งซ่อม"
                type="date"
                required
                variant="outlined"
              />
              <v-textarea
                v-model="repairData.repair_note"
                label="หมายเหตุการแจ้งซ่อม"
                rows="2"
                auto-grow
                variant="outlined"
              />
              <v-text-field
                v-model="repairData.appointment_date"
                label="นัดวันเข้าไปซ่อม"
                type="date"
                variant="outlined"
              />
              <v-text-field
                v-model="repairData.parts_cost"
                label="ค่าอะไหล่"
                type="number"
                variant="outlined"
              />
              <v-text-field
                v-model="repairData.service_fee"
                label="ค่าบริการ"
                type="number"
                variant="outlined"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" @click="repairDialog = false">ยกเลิก</v-btn>
            <v-btn color="success" @click="submitRepair">บันทึก</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Layout from "@/components/AssetsLayout.vue";
import Swal from 'sweetalert2';

// State
const borrowItems = ref([]);
const loading = ref(true);

// หัวตาราง
const headers = [
  { title: "รหัสทรัพย์สิน", key: "asset_code" },
  { title: "ชื่อทรัพย์สิน", key: "asset_name" },
  { title: "ลูกค้า", key: "customer_name" },
  { title: "ที่อยู่", key: "manual_address" },
  { title: "วันหมดประกัน", key: "warranty_expire" },
  { title: "สถานะ", key: "status", align: "center" },
  { title: "เอกสาร", key: "documents", sortable: false, align: "center" },
  { title: "การจัดการ", key: "actions", sortable: false, align: "center" },
];

// โหลดข้อมูล
const fetchBorrowItems = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getitemcustomerborrow"
    );
    borrowItems.value = res.data.data || [];
  } catch (err) {
    console.error("โหลดข้อมูลล้มเหลว:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBorrowItems();
});

const fileUrl = (path) => {
  if (!path) return "#";
  return "http://localhost:4512/" + path.replace(/\\/g, "/");
};

// สีของสถานะ
const getStatusColor = (status) => {
  switch (status) {
    case "จัดส่งแล้ว":
      return "green";
    case "รออนุมัติ":
      return "orange";
    case "ดำเนินการซ่อม":
      return "red";
    default:
      return "grey";
  }
};

//บันทึกการซ่อม
const repairDialog = ref(false);
const selectedItem = ref(null);
const repairData = ref({
  customerborrow_request_id: null,
  repair_report_date: "",
  repair_note: "",
  appointment_date: "",
  parts_cost: null,
  service_fee: null,
  repair_status: "รอดำเนินการ",
});

const openRepairDialog = (item) => {
  selectedItem.value = item;
  repairData.value.customerborrow_request_id = item.customerborrow_request_id;
  repairDialog.value = true;
};

const submitRepair = async () => {
  try {
    const total_cost =
      parseFloat(repairData.value.parts_cost || 0) +
      parseFloat(repairData.value.service_fee || 0);

    const payload = {
      ...repairData.value,
      total_cost,
    };

    await axios.post(
      "http://localhost:4512/api/customer/reportRepair",
      payload
    );

    repairDialog.value = false;

    await Swal.fire({
      icon: 'success',
      title: 'แจ้งซ่อมสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      timer: 2000,
      showConfirmButton: false
    });

    // ถ้าต้องการ reload data:
    fetchBorrowItems();
  } catch (err) {
    console.error("บันทึกการแจ้งซ่อมล้มเหลว:", err);

    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
      confirmButtonText: 'ตกลง'
    });
  }
};

//ดูรายละเอียดการรับประกัน
const detail = (item) => {
  console.log(item)
}
</script>
