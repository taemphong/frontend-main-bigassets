<template>
  <Layout>
    <h1 class="mt-6">กำหนดสิทธิ์</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
          <v-sheet border rounded>
            <v-data-table
              :headers="headers"
              :hide-default-footer="employees.length < 11"
              :items="employees"
              :loading="loading"
            >
              <template v-slot:[`item.first_name`]="{ value }">
                <span class="font-medium">{{ value }}</span>
              </template>

              <template v-slot:[`item.last_name`]="{ value }">
                <span class="font-medium">{{ value }}</span>
              </template>

              <template v-slot:[`item.phone`]="{ value }">
                <span class="font-medium">{{ value }}</span>
              </template>

              <template v-slot:[`item.position`]="{ value }">
                <v-chip label>{{ value }}</v-chip>
              </template>

              <template v-slot:[`item.department_name`]="{ value }">
                <span>{{ value ?? "-" }}</span>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex justify-center">
                  <v-btn
                    variant="tonal"
                    @click="addpermission(item.employee_id)"
                  >
                    กำหนดสิทธิ์
                  </v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <v-btn
                  prepend-icon="mdi-backup-restore"
                  rounded="lg"
                  text="โหลดอีกครั้ง"
                  @click="fetchEmployees()"
                >
                  โหลดอีกครั้ง
                </v-btn>
              </template>
            </v-data-table>
          </v-sheet>
        </v-col>
      </v-row>
     <v-dialog v-model="permissionDialog" max-width="500px">
  <v-card>
    <v-card-title>กำหนดสิทธิ์ผู้ใช้งาน</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitPermission" ref="formRef">
        <v-text-field
          v-model="form.username"
          label="ชื่อผู้ใช้งาน (Username)"
          required
          variant="outlined"
        />
        <v-text-field
          v-model="form.password"
          label="รหัสผ่าน (Password)"
          required
          variant="outlined"
        />
        <v-select
          v-model="form.role_id"
          label="บทบาท (Role)"
          :items="roles"
          item-title="role_name"
          item-value="role_id"
          required
          variant="outlined"
        />
        <v-card-actions class="justify-end mt-4">
          <v-btn text="ยกเลิก" @click="permissionDialog = false" />
          <v-btn color="primary" type="submit" text="บันทึก" />
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import axios from "axios";
import { ref, onMounted } from "vue";

const employees = ref([]);
const loading = ref(false);
const permissionDialog = ref(false);
const roles = ref([]);


const headers = [
  { title: "ชื่อ", key: "first_name" },
  { title: "นามสกุล", key: "last_name" },
  { title: "เบอร์โทร", key: "phone" },
  { title: "ตำแหน่ง", key: "position" },
  { title: "แผนก", key: "department_name" },
  { title: "จัดการสิทธิ์", key: "actions", sortable: false, align: "center" },
];

const fetchRoles = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/login/getAllRoles"
    );
    if (data.status === "success") {
      roles.value = data.result;
    }
  } catch (error) {
    console.error("❌ ดึงบทบาทล้มเหลว:", error);
  }
};

const fetchEmployees = async () => {
  loading.value = true;
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/employee/getAllEmployees"
    );
    if (data.status === "success") {
      employees.value = data.result;
    }
  } catch (err) {
    console.error("ดึงข้อมูลพนักงานล้มเหลว", err);
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchEmployees();
  fetchRoles();
});

const formRef = ref(null)

const form = ref({
  username: '',
  password: '',
  role_id: null,
  employee_id: null
})

const addpermission = (employee_id) => {
  console.log("addpermission:", employee_id)
  form.value = {
    username: '',
    password: '',
    role_id: null,
    employee_id: employee_id
  }
  permissionDialog.value = true
}

const submitPermission = async () => {
  try {
    const { data } = await axios.post("http://localhost:4512/api/login/adduser", form.value)
    if (data.status === 'success') {
      permissionDialog.value = false
      alert("✅ เพิ่มผู้ใช้งานสำเร็จ")
    } else {
      alert("❌ เพิ่มไม่สำเร็จ: " + data.message)
    }
  } catch (error) {
    console.error("เพิ่มผู้ใช้งานล้มเหลว:", error)
    alert("เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน")
  }
}
</script>
