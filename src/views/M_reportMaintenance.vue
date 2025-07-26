<template>
  <Layout>
    <h1 class="text-center mt-12">แจ้งซ่อมบำรุง</h1>
    <v-container>
      <v-row justify="center" class="mt-1">
        <v-col cols="12" md="8" lg="8">
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

              <v-col cols="12">
                <v-text-field
                  v-model="reporter_name"
                  label="ชื่อผู้แจ้งซ่อม"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="reporter_contact"
                  label="เบอร์ติดต่อผู้แจ้งซ่อม"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  label="มอบหมายช่าง"
                  variant="outlined"
                  v-model="assigned_to"
                  density="compact"
                  :items="employees"
                  :item-title="(item) => `${item.first_name} ${item.last_name}`"
                  item-value="employee_id"
                  placeholder="เลือกช่าง"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  label="หมายเหตุการแจ้งซ่อม"
                  variant="outlined"
                  v-model="issue_description"
                  density="compact"
                  rows="4"
                  auto-grow
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="text-right">
                <v-btn color="primary" @click="addTomaintenanceRequests">
                  แจ้งซ่อมบำรุง
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-alert type="warning" v-else>
            ไม่พบข้อมูลทรัพย์สิน กรุณากลับไปเลือกใหม่
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from '@/components/AssetsLayout.vue';
import { useAssetStore } from "@/stores/assetStore";
import { computed, ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();

const assetStore = useAssetStore();

// ดึงข้อมูลจาก store
const asset = computed(() => assetStore.selectedAsset);

//แจ้งซ่อมบำรุง
const issue_description = ref("");
const reporter_name = ref("");
const reporter_contact = ref("");
const assigned_to = ref(null);

const addTomaintenanceRequests = async () => {
  if (!asset.value || !asset.value.asset_id || !issue_description.value || !reporter_name.value) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
    const response = await axios.post("http://localhost:4512/api/maintenance/reportMaintenance", {
      asset_id: asset.value.asset_id,
      reporter_name: reporter_name.value,
      reporter_contact: reporter_contact.value,
      issue_description: issue_description.value,
      assigned_to: assigned_to.value,
    });

    if (response.data.status === "success") {
      await Swal.fire({
        icon: 'success',
        title: 'แจ้งซ่อมเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false
      });
      assetStore.clearSelectedAsset();
      reporter_name.value = "";
      reporter_contact.value = "";
      issue_description.value = "";

      router.push('/addassetsetting');
    } else {
       await Swal.fire({
        icon: 'error',
        title: 'แจ้งซ่อมไม่สำเร็จ',
        text: response.data.message || 'ไม่สามารถแจ้งซ่อมได้',
      });
    }
  } catch (err) {
    console.error("แจ้งซ่อมล้มเหลว:", err);
    alert("เกิดข้อผิดพลาดในการส่งข้อมูลแจ้งซ่อม");
  }
};

//ดึงข้อมูลพนักงาน
const employees = ref([]);

const fetchEmployees = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/employee/getAllEmployeesMaintenance"
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