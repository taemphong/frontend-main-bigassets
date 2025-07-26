<template>
  <Layout>
    <h1 class="text-center mt-12">ขอยืมให้ลูกค้า</h1>
    <v-container>
      <v-row justify="center" class="mt-1">
        <v-col cols="12" md="8" lg="8">
           <v-card class="pa-4" v-if="asset">
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
                  label="รหัสทรัพย์สิน"
                  variant="outlined"
                  v-model="asset.asset_name"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
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
import { computed} from "vue";
import { useAssetStore } from "@/stores/assetStore";

const assetStore = useAssetStore();
// ดึงข้อมูลจาก store
const asset = computed(() => assetStore.selectedAsset);
</script> 