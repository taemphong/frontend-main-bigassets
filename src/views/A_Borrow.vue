<template>
  <Layout>
    <h1 class="text-center mt-12">เบิกทรัพย์สิน</h1>
    <v-container>
      <v-row class="mt-4 justify-center">
        <!-- ฝั่งซ้าย -->
        <v-col cols="12" md="4">
          <v-card class="pa-4" v-if="asset">
            <h2>รายการทรัพย์สินที่ท่านเลือก</h2>

            <v-row dense class="mt-4">
              <v-col cols="12" md="6">
                <v-text-field
                  label="รหัสทรัพย์สิน"
                  variant="outlined"
                  v-model="asset.asset_code"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="ชื่อทรัพย์สิน"
                  variant="outlined"
                  v-model="asset.asset_name"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-row dense>
                <v-col cols="12">
                  <v-select
                    label="ผู้ขอเบิก"
                    variant="outlined"
                    v-model="employee_id"
                    density="compact"
                    :items="employees"
                    :item-title="
                      (item) => `${item.first_name} ${item.last_name}`
                    "
                    item-value="employee_id"
                    placeholder="เลือกพนักงานที่ขอเบิก"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="วันที่คืนทรัพย์สิน (ไม่กำหนดได้)"
                    variant="outlined"
                    v-model="expected_return_date"
                    density="compact"
                    type="date"
                  />
                </v-col>
              </v-row>
              <v-col cols="12">
                <v-textarea
                  label="หมายเหตุ"
                  variant="outlined"
                  v-model="notes"
                  density="compact"
                  rows="4"
                  auto-grow
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="text-right">
                <v-btn color="primary" @click="addToBorrowRequests">
                  ตรวจสอบรายการ
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
          <v-alert type="warning" v-else>
            ไม่พบข้อมูลทรัพย์สิน กรุณากลับไปเลือกใหม่
          </v-alert>
        </v-col>

        <!-- ฝั่งขวา -->
        <v-col cols="12" md="7">
          <v-card class="pa-4">
            <h2>รายการคำขอเบิก</h2>

            <v-table class="mt-4" density="compact">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ทรัพย์สิน</th>
                  <th>ผู้เบิก</th>
                  <th>วันที่คืน</th>
                  <th>หมายเหตุ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in borrowRequests" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.asset_name }} ({{ item.asset_code }})</td>
                  <td>{{ item.employee_name }}</td>
                  <td>{{ item.expected_return_date }}</td>
                  <td>{{ item.notes }}</td>
                  <td>
                    <v-btn
                      color="error"
                      size="small"
                      @click="removeRequest(index)"
                      >ลบ</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-row class="mt-4" justify="end" align="center" gap="2">
              <v-col cols="12" md="2">
                <v-btn block color="yellow" @click="confirmBorrow"
                  >สร้างคำขอเบิก</v-btn
                >
              </v-col>
              <v-col cols="12" md="3">
                <v-btn block color="green" @click="confirmBorrow"
                  >สร้างคำขอเบิกและพิมพ์</v-btn
                >
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { useAssetStore } from "@/stores/assetStore";
import { computed, ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
const router = useRouter();

const assetStore = useAssetStore();

// ดึงข้อมูลจาก store
const asset = computed(() => assetStore.selectedAsset);

// const confirmBorrow = () => {
//   Swal.fire({
//     icon: "success",
//     title: "ยืนยันการเบิกสำเร็จ",
//     text: `คุณได้เบิก ${asset.value.asset_name} เรียบร้อยแล้ว!`,
//   }).then(() => {
//     assetStore.clearSelectedAsset(); // ✅ เคลียร์ทั้ง localStorage และ state
//   });
//   // หรือถ้าจะยิง API ก่อน:
//   // await axios.post('/api/borrow', { asset_id: asset.value.asset_id })
// };

//ตรวจสอบการเบิก
const borrowRequests = ref([]);

const addToBorrowRequests = () => {
 

  const selectedEmployee = employees.value.find(
    (e) => e.employee_id === employee_id.value
  );

  borrowRequests.value.push({
    asset_id: asset.value.asset_id,
    asset_code: asset.value.asset_code,
    asset_name: asset.value.asset_name,
    employee_id: employee_id.value,
    employee_name: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
    expected_return_date: expected_return_date.value,
    notes: notes.value,
  });

  // ล้างฟอร์มหลังเพิ่มรายการ
  employee_id.value = null;
  expected_return_date.value = "";
  notes.value = "";
};

const removeRequest = (index) => {
  borrowRequests.value.splice(index, 1);
};

//

const employee_id = ref(null);
const expected_return_date = ref("");
const notes = ref("");

const confirmBorrow = async () => {
  if (borrowRequests.value.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "ไม่มีข้อมูลคำขอเบิก",
      text: "กรุณาเพิ่มรายการก่อนกดสร้างคำขอเบิก",
    });
    return;
  }

  try {
    let successCount = 0;

    for (const item of borrowRequests.value) {
      const payload = {
        employee_id: item.employee_id,
        asset_id: item.asset_id,
        expected_return_date: item.expected_return_date,
        notes: item.notes,
      };

      console.log("ส่งข้อมูล:", payload);

      const { data } = await axios.post(
        "http://localhost:4512/api/borrow_request/addborrow",
        payload
      );

      if (data.status === "success") {
        successCount++;
      } else {
        console.error(`ไม่สำเร็จสำหรับ ${item.asset_name}`, data.message);
      }
    }

    if (successCount === borrowRequests.value.length) {
      Swal.fire({
        icon: "success",
        title: "สร้างคำขอเบิกสำเร็จ",
        text: `สร้างคำขอเบิก ${successCount} รายการเรียบร้อยแล้ว!`,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // ✅ เคลียร์ข้อมูล
        borrowRequests.value = [];
        assetStore.clearSelectedAsset(); // เคลียร์assetStoreทรัพย์สินที่เลือก
        employee_id.value = null;
        expected_return_date.value = "";
        notes.value = "";

        // ✅ ไปหน้าประวัติการเบิก
        router.push("/borrowhistory");
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "สร้างคำขอบางรายการไม่สำเร็จ",
        text: `สำเร็จ ${successCount}/${borrowRequests.value.length} รายการ`,
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่",
    });
    console.error("เกิด error ขณะส่ง API:", err);
  }
};

//ดึงข้อมูลพนักงาน
const employees = ref([]);

const fetchEmployees = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/employee/getAllEmployees"
    );
    if (data.status === "success") {
      employees.value = data.result;
    }
  } catch (err) {
    console.error("ดึงข้อมูลพนักงานล้มเหลว", err);
  }
};

onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
p {
  margin-bottom: 8px;
}
</style>

<!-- <v-col cols="12" md="8" lg="11" class="mt-5">
          <v-card class="pa-4" v-if="asset">
            <h3 class="mb-4">ข้อมูลทรัพย์สินที่เลือก</h3>
            <p><strong>รหัสทรัพย์สิน:</strong> {{ asset.asset_code }}</p>
            <p><strong>ชื่อทรัพย์สิน:</strong> {{ asset.asset_name }}</p>
            <p><strong>ประเภท:</strong> {{ asset.type_name }}</p>
            <p><strong>แบรนด์:</strong> {{ asset.brand }}</p>
            <p><strong>รุ่น:</strong> {{ asset.model }}</p>
            <p>
              <strong>ราคาซื้อ:</strong>
              {{ asset.purchase_price?.toLocaleString() }} บาท
            </p>

            <v-btn color="primary" class="mt-4" @click="confirmBorrow">
              ยืนยันการเบิก
            </v-btn>
          </v-card>

          <v-alert type="warning" v-else>
            ไม่พบข้อมูลทรัพย์สิน กรุณากลับไปเลือกใหม่
          </v-alert>
        </v-col> -->
