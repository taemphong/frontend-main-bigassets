<template>
  <Layout>
    <h1 class="text-center mt-8 mb-4">รายการแจ้งซ่อมบำรุงของฉัน</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="10" class="mx-auto">
          <v-data-table
            :headers="headers"
            :items="maintenanceRequests"
            :loading="loading"
            loading-text="กำลังโหลดข้อมูล..."
            class="elevation-1"
            item-value="maintenance_id"
          >
            <template v-slot:[`item.request_date`]="{ item }">
              {{ item.request_date }}
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" dark>
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="primary"
                size="small"
                @click="handleAssign(item.maintenance_id)"
                :disabled="item.status !== 'แจ้งซ่อม'"
              >
                รับเรื่อง
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from '@/components/AssetsLayout.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from "vue-router";
import Swal from 'sweetalert2';
const router = useRouter();

// ✅ เปลี่ยนตามจริง หรือใช้ localStorage
// const employee_id = ref("")

const maintenanceRequests = ref([])
const loading = ref(false)
const profile = ref(null); 

const headers = [
  { title: 'รหัสทรัพย์สิน', value: 'asset_code' },
  { title: 'ชื่อทรัพย์สิน', value: 'asset_name' },
  { title: 'วันที่แจ้งซ่อม', value: 'request_date' },
  { title: 'ผู้แจ้งซ่อม', value: 'reporter_name' },
  { title: 'เบอร์ติดต่อ', value: 'reporter_contact' },
  { title: 'สถานะ', value: 'status' },
  { title: 'จัดการ', value: 'actions', sortable: false }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'แจ้งซ่อม': return 'orange'
    case 'กำลังซ่อม': return 'blue'
    case 'ซ่อมเสร็จ': return 'green'
    default: return 'grey'
  }
}

const fetchMaintenanceRequests = async () => {
  if (!profile.value?.employee_id) {
    console.warn("ยังไม่มี profile หรือ employee_id");
    return;
  }

  loading.value = true
  try {
    const { data } = await axios.post('http://localhost:4512/api/maintenance/getTechnicianMaintenanceList', {
      employee_id: profile.value.employee_id
    })
    if (data.status === 'success') {
      maintenanceRequests.value = data.data
    } else {
      console.error('ดึงข้อมูลล้มเหลว:', data.message)
    }
  } catch (err) {
    console.error('ERROR:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMaintenanceRequests()
})

// ฟังก์ชันเมื่อช่างกด “รับเรื่อง”
const handleAssign = async () => {
    alert("ฟังก์ชันนี้ยังไม่ถูกกำหนด");
}

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
    await fetchMaintenanceRequests();
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
</script>
