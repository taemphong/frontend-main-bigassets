<template>
  <Layout>
    <h1 class="text-center">รายชื่อพนักงาน</h1>
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
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>
                    <v-icon color="medium-emphasis" icon="mdi-account-group" size="x-small" start></v-icon>
                    พนักงานทั้งหมด
                  </v-toolbar-title>
                  <v-btn
                    class="me-2"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    text="เพิ่มพนักงาน"
                    border
                    @click="addemployeeDialog = true"
                  ></v-btn>
                </v-toolbar>
              </template>

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
                <span>{{ value ?? '-' }}</span>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex justify-center">
                  <v-icon small icon="mdi-delete" @click="confirmDelete(item.employee_id)"></v-icon>
                </div>
              </template>

              <template v-slot:no-data>
                <v-btn prepend-icon="mdi-backup-restore" rounded="lg" text="โหลดอีกครั้ง" @click="fetchEmployees()">
                  โหลดอีกครั้ง
                </v-btn>
              </template>
            </v-data-table>
          </v-sheet>
        </v-col>
      </v-row>
      <v-dialog v-model="addemployeeDialog" max-width="500px">
  <v-card>
    <v-card-title class="text-h6 font-weight-bold">
      เพิ่มพนักงาน
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="submitAddEmployee">
        <v-text-field variant="outlined" v-model="form.first_name" label="ชื่อ" required />
        <v-text-field variant="outlined" v-model="form.last_name" label="นามสกุล" required />
        <v-text-field variant="outlined" v-model="form.phone" label="เบอร์โทร" required />
        <v-text-field variant="outlined" v-model="form.position" label="ตำแหน่ง" required />
        <v-select
          v-model="form.department_id"
          variant="outlined"
          :items="departments"
          item-title="department_name"
          item-value="department_id"
          label="แผนก"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text="ยกเลิก" @click="addemployeeDialog = false" />
      <v-btn color="primary" text="บันทึก" @click="submitAddEmployee" />
    </v-card-actions>
  </v-card>
</v-dialog>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import axios from 'axios'
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

const employees = ref([])
const loading = ref(false)
const addemployeeDialog = ref(false)

const headers = [
  { title: 'ชื่อ', key: 'first_name' },
  { title: 'นามสกุล', key: 'last_name' },
  { title: 'เบอร์โทร', key: 'phone' },
  { title: 'ตำแหน่ง', key: 'position' },
  { title: 'แผนก', key: 'department_name' },
  { title: 'จัดการ', key: 'actions', sortable: false },
]

const fetchEmployees = async () => {
  loading.value = true
  try {
    const { data } = await axios.post('http://localhost:4512/api/employee/getAllEmployees')
    if (data.status === 'success') {
      employees.value = data.result
    }
  } catch (err) {
    console.error('ดึงข้อมูลพนักงานล้มเหลว', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (employee_id) => {
  console.log('ลบ employee_id:', employee_id)
  // สามารถต่อ Swal.fire() ได้ที่นี่ถ้าต้องการ
}

onMounted(() => {
  fetchEmployees()
  fetchDepartments()
})

//เพิ่มพนักงาน
const formRef = ref(null)
const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  position: '',
  department_id: null,
})

const departments = ref([])

const fetchDepartments = async () => {
  try {
    const res = await axios.post('http://localhost:4512/api/employee/getAllDepartments')
    if (res.data.status === 'success') {
      departments.value = res.data.result
    }
  } catch (error) {
    console.error('ดึงแผนกล้มเหลว:', error)
  }
}

const submitAddEmployee = async () => {
  try {
    const { data } = await axios.post('http://localhost:4512/api/employee/addemployee', form.value)
    if (data.status === 'success') {
      await fetchEmployees()
      addemployeeDialog.value = false
      form.value = {
        first_name: '',
        last_name: '',
        phone: '',
        position: '',
        department_id: null,
      }

      await Swal.fire({
        icon: 'success',
        title: 'เพิ่มพนักงานสำเร็จ',
        showConfirmButton: false,
        timer: 1800,
      })
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'เพิ่มพนักงานไม่สำเร็จ',
        text: data.message || 'ไม่สามารถเพิ่มพนักงานได้',
      })
    }
  } catch (err) {
    console.error('เพิ่มพนักงานล้มเหลว:', err)
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err?.response?.data?.message || 'โปรดลองใหม่อีกครั้ง',
    })
  }
}

</script>
