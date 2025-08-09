<template>
  <Layout>
    <h1 class="text-center text-xl font-bold my-4">ทรัพย์สินรอจัดส่ง</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="10" class="mx-auto mt-5">
          <v-data-table
            class="elevation-1 py-4"
            :headers="headers"
            :items="waitingItems"
            :loading="loading"
            loading-text="กำลังโหลดข้อมูล..."
            density="comfortable"
          >
            <!-- แสดงชื่อลูกค้า -->
            <template v-slot:[`item.customer_name`]="{ item }">
              {{ item.customer_firstname }} {{ item.customer_lastname }}
            </template>

            <!-- แสดงที่อยู่ -->
            <template v-slot:[`item.manual_address`]="{ item }">
              <div>
                {{ item.manual_address }}
                <v-btn
                  v-if="item.map_url"
                  :href="item.map_url"
                  target="_blank"
                  size="x-small"
                  variant="text"
                  class="ml-2"
                >
                  แผนที่
                </v-btn>
              </div>
            </template>
            <!-- ปุ่มบันทึกจัดส่ง -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="success"
                size="small"
                variant="tonal"
                @click="markAsDelivered(item)"
              >
                บันทึกจัดส่ง
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Layout from "@/components/AssetsLayout.vue";
import { useDeliveryStore } from '@/stores/deliveryStore';
import { useRouter } from 'vue-router';

const waitingItems = ref([]);
const loading = ref(true);

const headers = [
  { title: "รหัสทรัพย์สิน", key: "asset_code" },
  { title: "ชื่อทรัพย์สิน", key: "asset_name" },
  { title: "ลูกค้า", key: "customer_name" },
  { title: "ที่อยู่จัดส่ง", key: "manual_address", align: "center" },
  { title: "การจัดการ", key: "actions", align: "center", sortable: false },
];

// โหลดข้อมูลเมื่อหน้าโหลด
const fetchWaitingItems = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getwaitingfprdelivery"
    );
    console.log("all", res);
    waitingItems.value = res.data.data || [];
  } catch (err) {
    console.error("โหลดข้อมูลล้มเหลว:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWaitingItems();
});

//ส่งข้อมูลบันทึกจัดส่ง
const router = useRouter();
const deliveryStore = useDeliveryStore();

const markAsDelivered = (item) => {
  deliveryStore.setSelectedItem(item); 
  router.push('/confrim_customer_borrow'); 
};

</script>
