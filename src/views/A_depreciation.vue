<template>
  <Layout>
    <h2 class="mb-4">คำนวณหาราคาเสื่อม</h2>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="11">
          <v-card elevation="3" class="pa-6">
            <v-row>
              <!-- รูปภาพ -->
              <v-col cols="12" md="4">
                <h3>รายละเอียดมูลค่า</h3>
                <v-row dense class="mt-2">
                  <v-col cols="12">
                    <p>ชื่อทรัพย์สิน : {{ asset.asset_name }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p>วันที่รับเข้า/เริ่มใช้งาน : {{ asset.purchase_date }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p>วันที่หมดประกัน : {{ asset.warranty_expire }}</p>
                  </v-col>
                </v-row>
              </v-col>

              <!-- ชื่อ -->
              <v-col cols="12" md="4">
                <!-- <h3 class="mb-4">{{ asset.asset_name }}</h3> -->
              </v-col>

              <!-- ข้อความอื่น -->
              <v-col cols="12" md="4">
                <v-row class="align-center">
                  <!-- คอลัมน์ซ้าย -->
                  <v-col cols="6" class="text-center">
                    <h4 class="font-weight-bold">ราคาซื้อ</h4>
                    <h3 class="font-weight-bold mt-2">
                      {{ asset.purchase_price }}
                    </h3>
                  </v-col>

                  <!-- เส้นแบ่งตรงกลาง -->
                  <v-divider vertical></v-divider>

                  <!-- คอลัมน์ขวา -->
                  <v-col cols="6" class="text-center">
                    <h4 class="font-weight-bold">มูลค่าทางบัญชี</h4>
                    <h3 class="font-weight-bold mt-2" style="color: #2196f3">
                      {{ (asset.net_value ?? 0).toLocaleString() }}
                    </h3>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-divider class="my-5"></v-divider>

            <!-- ส่วนฟอร์มคำนวณ -->
            <h3 class="mb-4">กรอกข้อมูลสำหรับคำนวณ</h3>
            <v-row dense="">
              <v-col cols="12" md="4">
                <v-text-field
                  label="ราคาซื้อ (บาท)"
                  variant="outlined"
                  type="number"
                  density="compact"
                  v-model="asset.purchase_price"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  label="อายุใช้งาน (ปี)"
                  variant="outlined"
                  type="number"
                  density="compact"
                  v-model="useful_life"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class="mt-n4">
              <v-col cols="12" md="4">
                <v-radio-group
                  v-model="salvage_mode"
                  label="เลือกประเภทมูลค่าซาก"
                  inline
                  color="green"
                >
                  <v-radio label="บาท" value="baht"></v-radio>
                  <v-radio label="เปอร์เซ็นต์" value="percent"></v-radio>
                </v-radio-group>
                <v-text-field
                  v-if="salvage_mode === 'baht'"
                  label="มูลค่าซาก (บาท)"
                  variant="outlined"
                  type="number"
                  density="compact"
                  v-model="manual_salvage_value"
                ></v-text-field>

                <v-text-field
                  v-else
                  label="มูลค่าซาก (เปอร์เซ็นต์)"
                  variant="outlined"
                  type="number"
                  density="compact"
                  v-model="salvage_percent"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-radio-group
                  v-model="depreciation_method"
                  label="เลือกวิธีคำนวณค่าเสื่อมราคา"
                  inline
                  color="green"
                >
                  <v-radio
                    label="เส้นตรง (Straight Line)"
                    value="straight_line"
                  ></v-radio>
                  <v-radio
                    label="ลดลงตามเวลา (Declining Balance)"
                    value="declining"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-end">
                <v-btn color="primary" @click="calculateDepreciation">
                  คำนวณค่าเสื่อมราคา
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="8" lg="11">
          <h3 class="mb-4">ผลการคำนวณค่าเสื่อมราคา</h3>
          <v-table density="comfortable" class="mb-4">
            <thead>
              <tr>
                <th class="text-center">ปีที่</th>
                <th class="text-center">ค่าเสื่อมราคา (บาท)</th>
                <th class="text-center">มูลค่าคงเหลือ (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in depreciationResults" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">
                  {{ item.depreciation.toLocaleString() }}
                </td>
                <td class="text-center">
                  {{ item.remaining_value.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { useAssetStore } from "@/stores/assetStore";
import { computed, ref } from "vue";
import axios from "axios";

const assetStore = useAssetStore();
const asset = computed(() => assetStore.selectedAsset);
console.log("assetStore:", assetStore.selectedAsset);

const salvage_mode = ref("baht");
const depreciation_method = ref("straight_line");
const useful_life = ref(null);
const salvage_percent = ref(null);
const manual_salvage_value = ref(null);

// ค่าที่ได้จาก API เพื่อนำไปแสดงตาราง
const depreciationResults = ref([]);

// ฟังก์ชันคำนวณ
const calculateDepreciation = async () => {
  try {
    const asset_id = asset.value.asset_id; // ดึง asset_id จาก store
    const url = `http://localhost:4512/api/asset/calculate-depreciation/${asset_id}`;

    const payload = {
      useful_life: useful_life.value,
      salvage_percent:
        salvage_mode.value === "percent" ? salvage_percent.value : null,
      manual_salvage_value:
        salvage_mode.value === "baht" ? manual_salvage_value.value : null,
      depreciation_method: depreciation_method.value,
    };

    console.log("Payload:", payload);

    const res = await axios.post(url, payload);

    console.log("ผลลัพธ์:", res.data);

    // ดึงข้อมูล annual_depreciation_list จาก API response
    depreciationResults.value = res.data.data.annual_depreciation_list;

    alert("คำนวณสำเร็จ ✅");
  } catch (error) {
    console.error("❌ คำนวณล้มเหลว:", error);
    alert("เกิดข้อผิดพลาดในการคำนวณ");
  }
};
</script>
