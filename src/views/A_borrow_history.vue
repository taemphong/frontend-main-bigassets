<template>
  <Layout>
    <h1 class="text-center mt-6">ประวัติการเบิก</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
          <v-card>
            <v-card-title>รายการคำขอเบิก</v-card-title>
            <v-data-table
              :headers="headers"
              :items="borrowRequests"
              :loading="loading"
              loading-text="กำลังโหลดข้อมูล..."
              class="elevation-1"
            >
              <template v-slot:[`item.request_date`]="{ item }">
                {{ formatDate(item.request_date) }}
              </template>
              <template v-slot:[`item.expected_return_date`]="{ item }">
                {{ item.expected_return_date }}
              </template>
              <template v-slot:[`item.status`]="{ item }">
                <v-chip :color="getStatusColor(item.status)" class="text-white">
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:[`item.return_status`]="{ item }">
                <v-chip
                  :color="getReturnStatusColor(item.return_status)"
                  class="text-white"
                >
                  {{ item.return_status }}
                </v-chip>
              </template>
              <template v-slot:[`item.reject_reason`]="{ item }">
                <span v-if="item.reject_reason">{{ item.reject_reason }}</span>
                <span v-else>-</span>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  v-if="
                    item.status === 'อนุมัติ' &&
                    item.return_status === 'ยังไม่คืน'
                  "
                  color="success"
                  variant="outlined"
                  size="small"
                  @click="confirmReturn(item)"
                >
                  คืนของ
                </v-btn>
                <span v-else>-</span>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();

const borrowRequests = ref([]);
const loading = ref(false);
const profile = ref(null); // profile จะถูกกำหนดภายหลังจาก token

const headers = [
  { title: "รหัสคำขอ", value: "borrow_code" },
  { title: "รายการทรัพย์สิน", value: "asset_name" },
  { title: "รหัสทรัพย์สิน", value: "asset_code" },
  { title: "วันที่ขอเบิก", value: "request_date" },
  { title: "วันที่คืนคาดหวัง", value: "expected_return_date" },
  { title: "สถานะคำขอ", value: "status" },
  { title: "สถานะการคืน", value: "return_status" },
  { title: "เหตุผลที่ไม่อนุมัติ", value: "reject_reason" },
  { title: "หมายเหตุการเบิก", value: "notes" },
  { title: "จัดการ", value: "actions", sortable: false },
];

// ดึงข้อมูลคำขอเบิกของ employee_id
const getBorrowRequests = async () => {
  if (!profile.value?.employee_id) {
    console.warn("ยังไม่มี profile หรือ employee_id");
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post(
      "http://localhost:4512/api/borrow_request/employeeborrowrequests",
      {
        employee_id: profile.value.employee_id,
      }
    );
    if (response.data.status === "success") {
      borrowRequests.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching borrow requests:", error);
  } finally {
    loading.value = false;
  }
};

// แปลงวันที่ให้อ่านง่าย
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// สีของสถานะการขอเบิก
const getStatusColor = (status) => {
  switch (status) {
    case "รออนุมัติ":
      return "warning";
    case "อนุมัติ":
      return "success";
    case "ไม่อนุมัติ":
      return "error";
    default:
      return "grey";
  }
};

// สีของสถานะการคืนของ
const getReturnStatusColor = (returnStatus) => {
  switch (returnStatus) {
    case "ยังไม่คืน":
      return "error";
    case "คืนแล้ว":
      return "success";
    default:
      return "grey";
  }
};

// ดึงข้อมูลโปรไฟล์จาก token และโหลดข้อมูลคำขอเบิก
const fetchProfile = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    await Swal.fire({
      icon: "warning",
      title: "ไม่พบข้อมูลการเข้าสู่ระบบ",
      text: "กรุณาล็อกอินก่อนใช้งาน",
      confirmButtonText: "ตกลง",
    });
    router.push("/");
    return;
  }

  try {
    const { data } = await axios.get(
      "http://localhost:4512/api/login/profile",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    profile.value = data.user;
    console.log("Profile:", profile.value);

    // ✅ ดึงข้อมูลคำขอเบิกทันทีหลังได้ profile
    await getBorrowRequests();
  } catch (err) {
    console.error(err);
    await Swal.fire({
      icon: "error",
      title: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
      text: err.response?.data?.message || err.message,
      confirmButtonText: "ตกลง",
    });
    router.push("/");
  }
};

onMounted(fetchProfile);

// ✅ ฟังก์ชันคืนทรัพย์สิน
const confirmReturn = async (item) => {
  console.log("borrow_request_id:", item.borrow_request_id);

  const confirm = await Swal.fire({
    title: `ยืนยันการคืน ${item.asset_name}?`,
    text: `รหัสเบิก: ${item.borrow_code}\nยืนยันหรือไม่`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });

  if (confirm.isConfirmed) {
    try {
      const response = await axios.post(
        "http://localhost:4512/api/borrow_request/requestReturn",
        { borrow_request_id: item.borrow_request_id }
      );

      console.log("✅ ส่งคำขอคืนสำเร็จ:", response.data);
      await Swal.fire({
        icon: "success",
        title: "ส่งคำขอคืนสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });

      await getBorrowRequests(); // รีโหลดข้อมูล
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถส่งคำขอคืนได้",
        text: error?.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    }
  } else {
    console.log("❌ ยกเลิกการคืนของ");
  }
};
</script>
