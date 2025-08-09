<template>
  <Layout>
    <h1>คำร้องขอ</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
          <!-- Toggle -->
          <v-btn-toggle
            v-model="requestFilter"
            rounded="xl"
            class="mb-4"
            mandatory
          >
            <v-btn value="">ทั้งหมด ({{ 0 }})</v-btn>
            <v-btn value="borrow" color="primary">
              <v-icon start>mdi-package-variant-closed</v-icon> เบิก ({{
                borrowCount
              }})
            </v-btn>

            <v-btn value="transfer" color="orange">
              <v-icon start>mdi-swap-horizontal</v-icon> โอน ({{ 0 }})
            </v-btn>

            <v-btn value="customer" color="yellow">
              <v-icon start>mdi-swap-horizontal</v-icon> ยืม ({{
                customerCount
              }})
            </v-btn>

            <v-btn value="return" color="info">
              <v-icon start>mdi-undo-variant</v-icon> คืน ({{ returnCount }})
            </v-btn>
          </v-btn-toggle>

          <!-- Window -->
          <v-window v-model="requestFilter">
            <v-window-item value="">
              <div class="pa-4">
                <h2>รายการทั้งหมด</h2>
                <p>แสดงรายการทุกประเภทที่นี่</p>
              </div>
            </v-window-item>

            <v-window-item value="borrow">
              <div class="pa-4">
                <h2>รายการคำขอเบิกทั้งหมด</h2>
                <v-row>
                  <v-col cols="12" md="8" lg="11" class="mt-5">
                    <v-card>
                      <v-data-table
                        :headers="headers"
                        :items="borrowRequests"
                        item-value="borrow_request_id"
                        class="elevation-1 mt-5"
                        density="comfortable"
                      >
                        <template v-slot:[`item.actions`]="{ item }">
                          <div class="d-flex justify-center" style="gap: 8px">
                            <v-btn
                              color="success"
                              size="small"
                              @click="
                                approve(item.borrow_request_id, item.asset_id)
                              "
                              >อนุมัติ</v-btn
                            >
                            <v-btn
                              color="error"
                              size="small"
                              @click="reject(item.borrow_request_id)"
                              >ไม่อนุมัติ</v-btn
                            >
                          </div>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <v-window-item value="transfer">
              <div class="pa-4">
                <h2>รายการโอน</h2>
                <p>แสดงเฉพาะรายการโอน</p>
              </div>
            </v-window-item>

            <v-window-item value="customer">
              <div class="pa-4">
                <h2>รายการคำขอยืมจากลูกค้า</h2>
                <v-row>
                  <v-col cols="12" md="8" lg="12" class="mt-5">
                    <v-card>
                      <v-data-table
                        :headers="customerHeaders"
                        :items="customerRequests"
                        item-value="customerborrow_request_id"
                        class="elevation-1 mt-5"
                        density="comfortable"
                      >
                        <template v-slot:[`item.customer_name`]="{ item }">
                          {{ item.customer_firstname }}
                          {{ item.customer_lastname }}
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                          <div class="d-flex justify-center" style="gap: 8px">
                            <v-btn
                              color="success"
                              size="small"
                              @click="
                                approveCustomerBorrow(
                                  item.customerborrow_request_id,
                                  item.asset_id
                                )
                              "
                            >
                              อนุมัติ
                            </v-btn>
                            <v-btn
                              color="error"
                              size="small"
                              @click="
                                rejectCustomerBorrow(
                                  item.customerborrow_request_id
                                )
                              "
                            >
                              ไม่อนุมัติ
                            </v-btn>
                          </div>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <v-window-item value="return">
              <div class="pa-4">
                <h2>รายการคำขอคืน</h2>
                <v-row>
                  <v-col cols="12" md="8" lg="12" class="mt-5">
                    <v-card>
                      <v-data-table
                        :headers="returnHeaders"
                        :items="returnRequests"
                        item-value="borrow_request_id"
                        class="elevation-1 mt-5"
                        density="comfortable"
                      >
                        <template v-slot:[`item.employee_name`]="{ item }">
                          {{ item.first_name }} {{ item.last_name }}
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                          <div class="d-flex justify-center" style="gap: 8px">
                            <v-btn
                              color="success"
                              size="small"
                              @click="confirmReturn(item)"
                              >ยืนยันการคืน</v-btn
                            >
                          </div>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Layout from "@/components/AssetsLayout.vue";
import axios from "axios";
import Swal from "sweetalert2";

const requestFilter = ref("");

//รายการคำขอเบิก
const borrowRequests = ref([]);
const borrowCount = ref(0);

const headers = [
  { title: "รหัสคำขอ", key: "borrow_code" },
  { title: "ชื่อผู้ขอ", key: "employee_name" },
  { title: "ทรัพย์สิน", key: "asset_name" },
  { title: "วันที่ขอ", key: "request_date" },
  { title: "คืนภายใน", key: "expected_return_date" },
  { title: "หมายเหตุ", key: "notes" },
  { title: "สถานะ", key: "status" },
  { title: "การจัดการ", key: "actions", sortable: false },
];

const fetchDataBorrow = async () => {
  try {
    const res = await axios.post(
      "http://localhost:4512/api/borrow_request/adminborrowrequests"
    );
    const data = res.data.data;
    borrowRequests.value = data;
    borrowCount.value = data.filter(
      (item) => item.status === "รออนุมัติ"
    ).length;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", error);
  }
};

const approve = async (borrow_request_id, asset_id) => {
  console.log("borrow_request_id:", borrow_request_id);
  console.log("asset_id:", asset_id);

  try {
    const response = await axios.post(
      "http://localhost:4512/api/borrow_request/approveBorrow",
      {
        borrow_request_id: borrow_request_id,
        asset_id: asset_id,
      }
    );

    console.log("อนุมัติสำเร็จ:", response.data);

    Swal.fire({
      icon: "success",
      title: "อนุมัติสำเร็จ",
      text: "อนุมัติคำขอสำเร็จแล้ว",
      timer: 2000,
      showConfirmButton: false,
    });
    fetchDataBorrow();
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    alert("ไม่สามารถอนุมัติได้");
  }
};

const reject = async (id) => {
  console.log("ไม่อนุมัติคำขอเบิก ID:", id);
};

onMounted(fetchDataBorrow);
//

//รายการคำขอคืน
const returnCount = ref(0);
const returnRequests = ref([]);

const returnHeaders = [
  { title: "รหัสคำขอ", key: "borrow_code" },
  { title: "ชื่อผู้ขอ", key: "employee_name" },
  { title: "ทรัพย์สิน", key: "asset_name" },
  { title: "วันที่ขอ", key: "request_date" },
  { title: "คืนภายใน", key: "expected_return_date" },
  { title: "หมายเหตุ", key: "notes" },
  { title: "สถานะ", key: "status" },
  { title: "การจัดการ", key: "actions", sortable: false },
];

const fetchDataReturn = async () => {
  try {
    const res = await axios.post(
      "http://localhost:4512/api/borrow_request/admingetreturnrequest"
    );
    returnRequests.value = res.data.data;
    const data = res.data.data;
    returnCount.value = data.filter(
      (item) => item.status === "รออนุมัติคืน"
    ).length;
  } catch (error) {
    console.error("โหลดข้อมูลคืนล้มเหลว:", error);
  }
};

const confirmReturn = async (item) => {
  const confirm = await Swal.fire({
    title: `ยืนยันการคืน ${item.asset_name}?`,
    text: `รหัสเบิก: ${item.borrow_code}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });

  if (confirm.isConfirmed) {
    try {
      const res = await axios.post(
        "http://localhost:4512/api/borrow_request/adminapproveReturn",
        {
          borrow_request_id: item.borrow_request_id,
        }
      );
      console.log(res.data.message);
      Swal.fire({
        icon: "success",
        title: "ยืนยันสำเร็จ",
        text: "ระบบบันทึกการคืนสำเร็จแล้ว",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchDataReturn();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: error?.response?.data?.message || "ไม่สามารถบันทึกการคืนได้",
      });
    }
  }
};

onMounted(() => {
  fetchDataReturn();
});
//

//รานการคำขอยืม
const customerCount = ref(0);
const customerRequests = ref([]);
const customerHeaders = [
  { title: "รหัสคำขอ", key: "customerborrow_request_id" },
  { title: "รหัสทรัพย์สิน", key: "asset_code" },
  { title: "ชื่อทรัพย์สิน", key: "asset_name" },
  { title: "ลูกค้า", key: "customer_name" },
  { title: "สถานะ", key: "status" },
  { title: "การจัดการ", key: "actions", sortable: false, align: "center" },
];

const fetchCustomerRequests = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getRequestcustomerborrow"
    );
    customerRequests.value = res.data.data;
    const data = res.data.data;
    customerRequests.value = data;
    customerCount.value = data.filter(
      (item) => item.status === "รออนุมัติ"
    ).length;
  } catch (error) {
    console.error("โหลดข้อมูลคำขอยืมลูกค้าล้มเหลว:", error);
  }
};

const approveCustomerBorrow = async (requestId) => {
  try {
    const res = await axios.post(
      "http://localhost:4512/api/customer/approveCustomerBorrowRequest",
      {
        customerborrow_request_id: requestId,
      }
    );

    if (res.data.status === "success") {
      await Swal.fire({
        icon: "success",
        title: "อนุมัติสำเร็จ",
        text: res.data.message || "ระบบได้อนุมัติคำขอยืมแล้ว",
        timer: 2000,
        showConfirmButton: false,
      });

      // รีเฟรชรายการหลังจากอนุมัติ
      fetchCustomerRequests();
    } else {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถอนุมัติได้",
        text: res.data.message || "กรุณาลองใหม่อีกครั้ง",
      });
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text:
        error?.response?.data?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  }
};

const rejectCustomerBorrow = async (requestId) => {
  console.log("ไม่อนุมัติคำขอยืมลูกค้า ID:", requestId);
};

onMounted(() => {
  fetchCustomerRequests();
});
//
</script>
