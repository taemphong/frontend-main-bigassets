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
        style="max-width: 300px;"
        class="mr-5"
        @click:append-inner="onClick"
      ></v-text-field>
        <v-btn class="text-none" stacked>
      <v-badge color="error" content="10">
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>
      <v-btn class="mr-4" icon @click="startScan" >
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
        <v-list-item-title class="mt-6" style="font-size: 20px; font-weight: 600;"> <v-icon left color="#FF0033">mdi-cube-outline</v-icon>
          ระบบบริหารทรัพย์สิน
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider class="mt-3"></v-divider>
    <v-row >
    <v-col cols="3">
    <v-list-item class="mt-4">
        <v-list-item-icon>
            <v-icon size="30" color="#FF0033">mdi-account-circle</v-icon> 
        </v-list-item-icon>
    </v-list-item>
    </v-col>
    <v-col cols="6" >
        <h4 class="mt-2"> รอ api</h4>
        <p style="font-size: 14px;">รอ api </p>
    </v-col>
    </v-row>
    <v-divider class="mt-3"></v-divider>
      <v-list dense nav class="menu-list">
        <v-list-item prepend-icon="mdi-home" title="หน้าแรก" to="/home" />
        <v-list-item prepend-icon="mdi-home" title="เพิ่มรายการทรัพย์สิน" to="/addassets" />
      </v-list>


      <template v-slot:append>
        <v-divider class="mb-4"></v-divider>
        <div class="d-flex justify-center pa-2">
    <v-btn
      @click="logout"
      style="width: 190px; height: 40px;"
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
import { ref, watch } from "vue";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";


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
    alert("กำลังพัฒนา")
    
}

async function logout() {
  // 1) ลบ accessToken จาก localStorage
  localStorage.removeItem('accessToken');
  router.push("/");
}



</script>

<style scoped>
.v-navigation-drawer {
  color: #fff;
}

.layout-background {
  background-color: #F5F5F5 !important;
}


</style>
