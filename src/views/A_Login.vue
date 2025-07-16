<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <h1 class="text-center mb-7">เข้าสู่ระบบ</h1>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              label="ชื่อผู้ใช้"
              rounded=""
              variant="solo-filled"
              v-model="form.username"
            />
            <v-text-field
              label="รหัสผ่าน"
              rounded=""
              type="password"
              variant="solo-filled"
              v-model="form.password"
            />
            <v-btn rounded="" color="#FF3333" block type="submit">เข้าสู่ระบบ</v-btn>
          </v-form>
        </v-card-text>
        <h3 class="text-center mt-5">เวลาปัจจุบัน {{ currentDateTime }} </h3>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useRouter } from 'vue-router'

const apiBase = process.env.VUE_APP_API_BASE_URL
console.log("apirequest", apiBase)

const router = useRouter()
const currentDateTime = ref('')
const form = ref({
  username: '',
  password: ''
})

let timerId = null

function updateDateTime() {
  const now = new Date()
  currentDateTime.value = now.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateDateTime()
  timerId = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

async function login() {
  try {
    const resp = await axios.post(`${apiBase}/api/login/loginaccount`, {
      username: form.value.username,
      password: form.value.password
    })

    const { status, accessToken } = resp.data
    if (status !== 'success' || !accessToken) {
      await Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonText: 'ลองอีกครั้ง'
      })
      return
    }

    localStorage.setItem('accessToken', accessToken)
    router.push('/home')
  } catch (err) {
    console.error(err)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text:
        err.response?.data?.message ??
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
      confirmButtonText: 'ตกลง'
    })
  }
}
</script>

<style scoped>
</style>
