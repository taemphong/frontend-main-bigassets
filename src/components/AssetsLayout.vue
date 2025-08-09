<template>
  <v-app class="layout-background">
    <!-- App Bar -->
    <v-app-bar app flat color="transparent">
      <!-- แสดงปุ่มแฮมเบอร์เกอร์บนจอเล็ก -->
      <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawer = !drawer" />

      <v-spacer />

      <v-text-field
        :loading="loading"
        append-inner-icon="mdi-magnify"
        density="compact"
        label="ค้นหา"
        variant="outlined"
        hide-details
        single-line
        rounded=""
        style="max-width: 300px"
        class="mr-5"
        @click:append-inner="onClick"
      ></v-text-field>
      <v-btn class="text-none" stacked>
        <v-badge color="error" content="10">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
      <v-btn class="mr-4" icon @click="startScan">
        <v-icon>mdi-qrcode-scan</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Sidebar: permanent บน mdUp, temporary บน sm/xs -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      :permanent="mdAndUp"
      color="white"
      theme="dark"
      width="250"
    >
      <v-list-item class="d-flex justify-center">
        <v-list-item-content class="text-center">
          <v-list-item-title
            class="mt-6"
            style="font-size: 20px; font-weight: 600"
          >
            <v-icon left color="#FF0033">mdi-cube-outline</v-icon>
            ระบบบริหารทรัพย์สิน
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-3"></v-divider>
      <v-row>
        <v-col cols="3">
          <v-list-item class="mt-4">
            <v-list-item-icon>
              <v-icon size="30" color="#FF0033">mdi-account-circle</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-col>
        <v-col cols="6" v-if="profile">
          <h4 class="mt-2">{{ profile.first_name }}</h4>
          <p style="font-size: 14px">{{ profile.position }}</p>
        </v-col>
      </v-row>
      <v-divider class="mt-3"></v-divider>
      <v-list dense nav class="menu-list">
        <v-list-item prepend-icon="mdi-home" title="หน้าแรก" to="/home" />
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="แดชบอร์ด"
          to="/dashboard"
          v-if="profile?.role_name === 'Admin'"
        />
        <v-list-item
          prepend-icon="mdi-plus"
          title="เพิ่มรายการทรัพย์สิน"
          to="/addassets"
          v-if="profile?.role_name === 'Admin'"
        />
        <v-list-item
          prepend-icon="mdi-file-document-edit"
          title="จัดการทรัพย์สิน"
          to="/addassetsetting"
        />
        <v-list-item
          prepend-icon="mdi-finance"
          title="บัญชีทรัพย์สิน"
          to="/fixdasset"
          v-if="profile?.role_name === 'Admin'"
        />
        <v-list-item
          prepend-icon="mdi-account-group"
          title="พนักงาน"
          to="/employee"
          v-if="profile?.role_name === 'Admin'"
        />
        <v-list-item
          prepend-icon="mdi-archive-outline"
          title="ประวัติรายการเบิก"
          to="/borrowhistory"
        />
        <v-list-item
          prepend-icon="mdi-truck"
          title="ทรัพย์สินรอจัดส่ง"
          to="/customer_awaiting_shipment"
        />
        <v-list-item
          prepend-icon="mdi-map-search"
          title="แผนที่ติดตามทรัพย์สิน"
          to="/trackingasset"
        />
        <v-list-item
          prepend-icon="mdi-account-arrow-right"
          title="รายการทรัพย์สินที่ลูกค้ายืม"
          to="/customer_item"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-account"
          title="รายการซ่อมของลูกค้า"
          to="/customer_repair"
        />
        <v-list-item
          prepend-icon="mdi-tools"
          title="รายการแจ้งซ่อมบำรุง"
          to="/maintenance"
          v-if="['Admin', 'ช่างซ่อมบำรุง'].includes(profile?.role_name)"
        />
        <v-list-item
          prepend-icon="mdi-file-document-outline"
          title="คำร้องขอ"
          to="/adminrequest"
          v-if="profile?.role_name === 'Admin'"
        />
        <v-list-item
          prepend-icon="mdi-lock"
          title="กำหนดสิทธิ์"
          to="/adminSetpermission"
          v-if="profile?.role_name === 'Admin'"
        />
      </v-list>

      <template v-slot:append>
        <v-divider class="mb-4"></v-divider>
        <div class="d-flex justify-center pa-2">
          <v-btn
            @click="logout"
            style="width: 190px; height: 40px"
            class="mt-auto mb-4"
            color="#FF0033"
            variant="tonal"
          >
            <v-icon left>mdi-logout</v-icon>ออกจากระบบ
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid :class="mdAndUp ? 'ml-8 mt-n13' : 'mt-6'">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import axios from "axios";

// ตรวจ breakpoint
const { mdAndUp } = useDisplay();

// สถานะ drawer, เริ่มต้นตาม mdAndUp
const drawer = ref(mdAndUp.value);

// ซิงก์ค่า drawer กับ breakpoint
watch(
  mdAndUp,
  (val) => {
    drawer.value = val;
  },
  { immediate: true }
);

const router = useRouter();

async function startScan() {
  router.push("/qr-scan")
}

async function logout() {
  // 1) ลบ accessToken จาก localStorage
  localStorage.removeItem("accessToken");
  router.push("/");
}

//จัดการสิทธิ์การเข้าถึง

const profile = ref(null);

async function fetchProfile() {
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
      `http://localhost:4512/api/login/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    profile.value = data.user;
    console.log("Profile:", profile.value);

    // ลบส่วนเช็ค role_name ออกชั่วคราว
    // if (profile.value.role_name !== 'Admin') { ... }
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
}

onMounted(fetchProfile);
</script>

<style scoped>
.v-navigation-drawer {
  color: #fff;
}

.layout-background {
  background-color: #f5f5f5 !important;
}

.v-navigation-drawer {
  max-height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin; 
  scrollbar-color: #ccc transparent; 
}

.v-navigation-drawer::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15); 
  border-radius: 4px;
}
</style>
