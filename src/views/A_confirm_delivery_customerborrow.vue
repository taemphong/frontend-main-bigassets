<template>
  <Layout>
    <h1 class="text-center mt-12">บันทึกจัดส่ง</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
          <v-card class="pa-6" elevation="2" rounded="lg">
            <v-row>
              <!-- ฝั่งซ้าย -->
              <v-col cols="12" md="6" v-if="selectedItem">
                <v-card class="pa-4">
                  <h3 class="mb-4">ข้อมูลลูกค้า</h3>

                  <p>
                    ชื่อลูกค้า: {{ selectedItem.customer_firstname }}
                    {{ selectedItem.customer_lastname }}
                  </p>
                  <p>ที่อยู่จัดส่ง: {{ selectedItem.manual_address }}</p>
                  <p>รหัสทรัพย์สิน: {{ selectedItem.asset_code }}</p>
                  <p>ชื่อ: {{ selectedItem.asset_name }}</p>
                  <p>สถานะ: {{ selectedItem.status }}</p>

                  <v-divider class="my-4" />

                  <h3 class="mb-2">ข้อมูลการชำระเงิน</h3>

                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="ยอดที่ต้องชำระ"
                        :model-value="selectedItem.expected_deposit_amount"
                        readonly
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="ยอดที่ชำระแล้ว"
                        :model-value="selectedItem.initial_deposit_paid"
                        readonly
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="ยอดค้างชำระ"
                        :model-value="
                          (
                            parseFloat(selectedItem.expected_deposit_amount) -
                            parseFloat(selectedItem.initial_deposit_paid)
                          ).toFixed(2)
                        "
                        readonly
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>

                  <v-divider class="my-4" />

                  <h3 class="mb-2">ชำระเงินเพิ่มเติม</h3>

                  <v-text-field
                    v-model="remaining_deposit_amount"
                    label="จำนวนเงินที่ชำระเพิ่มเติม"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                  />

                  <v-file-input
                    v-model="slip"
                    label="แนบสลิป/หลักฐานการโอน"
                    accept="image/*,.pdf"
                    prepend-icon="mdi-paperclip"
                    variant="outlined"
                    density="compact"
                  />

                  <div class="d-flex justify-end mt-4">
                    <v-btn
                      color="success"
                      @click="submitAdditionalPayment"
                      :disabled="!remaining_deposit_amount || !slip"
                    >
                      บันทึกชำระเงินที่เหลือ
                    </v-btn>
                  </div>
                  <v-divider class="my-4" />

                  <v-file-input
                    v-model="rental_contract_url"
                    label="แนบสัญญาเช่า (ถ้ามี)"
                    accept="application/pdf,image/*"
                    prepend-icon="mdi-file-document"
                    variant="outlined"
                    density="compact"
                  />
                </v-card>
              </v-col>

              <!-- ฝั่งขวา -->
              <v-col cols="12" md="6" v-if="selectedItem">
                <h3 class="mb-4">รายละเอียดการรับประกัน (ถ้ามี)</h3>

                <v-textarea
                  v-model="warranty_detail"
                  label="รายละเอียดการรับประกัน"
                  rows="5"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                />

                <v-divider class="my-6" />

                <h3 class="mb-4">ข้อมูลสเป็คของทรัพย์สิน (ถ้ามี)</h3>

                <v-textarea
                  v-model="asset_specification"
                  label="รายละเอียดสเป็คสินค้า"
                  rows="6"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <div class="d-flex justify-end mt-4">
              <v-btn color="success" @click="confrimDerivery"> บันทึกจัดส่ง </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from 'vue-router';

const router = useRouter();

const deliveryStore = useDeliveryStore();
const selectedItem = ref(null);

const loadItem = () => {
  deliveryStore.loadSelectedItem();
  selectedItem.value = deliveryStore.selectedItem;
  console.log("🚚 ข้อมูลที่โหลด:", selectedItem.value);
};



onMounted(() => {
  loadItem();
});

//บันทึกมัดจำรอบสอง
const remaining_deposit_amount = ref("");
const slip = ref(null);

const submitAdditionalPayment = async () => {
  const formData = new FormData();
  formData.append(
    "customerborrow_request_id",
    selectedItem.value.customerborrow_request_id
  );
  formData.append("remaining_deposit_amount", remaining_deposit_amount.value);
  formData.append("slip", slip.value); // ไฟล์

  try {
    const res = await axios.post(
      "http://localhost:4512/api/customer/updateRemainingDepositAmount",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      text: res.data.message,
      timer: 2000,
      showConfirmButton: false,
    });

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
    });
  }
};

//บันทึกจบจัดส่ง
const warranty_detail = ref("")
const asset_specification = ref("")
const rental_contract_url = ref(null)

const confrimDerivery = async () => {
  const formData = new FormData();
  formData.append("customerborrow_request_id", selectedItem.value.customerborrow_request_id);
  formData.append("asset_id", selectedItem.value.asset_id);
  formData.append("warranty_detail", warranty_detail.value);
  formData.append("asset_specification", asset_specification.value);
  formData.append("rental_contract_file", rental_contract_url.value); 

  try {
    const response = await axios.post(
      "http://localhost:4512/api/customer/updateDeliveryInfo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.status === "success") {
      try {
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกจัดส่งสำเร็จ',
          showConfirmButton: false,
          timer: 2000
        });

        // ✅ ห่อ try/catch ย่อยเพื่อดัก error ที่อาจเกิดหลัง Swal
        deliveryStore.clearSelectedItem();
        selectedItem.value = null;
        router.push('/customer_item');

      } catch (innerErr) {
        console.error("❌ ERROR หลังจาก Swal:", innerErr);
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดหลังจากบันทึก',
          text: innerErr?.message || 'ไม่สามารถเปลี่ยนหน้าได้',
        });
      }

    } else {
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: response.data.message || 'ไม่สามารถบันทึกข้อมูลได้',
      });
    }
  } catch (err) {
    console.error("❌ ERROR จาก axios:", err);
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err?.response?.data?.message || err.message || 'ไม่สามารถบันทึกข้อมูลได้',
    });
  }
};
</script>

<style scoped></style>
