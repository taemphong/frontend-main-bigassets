<template>
  <Layout>
    <h1 class="text-center mt-5 mb-4">ขอยืมให้ลูกค้า</h1>
    <v-container>
      <v-row justify="center" class="mt-2" align="stretch">
        <!-- ฝั่งซ้าย: ข้อมูลทรัพย์สิน -->
        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100" v-if="asset">
            <h3 class="mb-4">ข้อมูลทรัพย์สิน</h3>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="รหัสทรัพย์สิน"
                  variant="outlined"
                  v-model="asset.asset_code"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="ชื่อทรัพย์สิน"
                  variant="outlined"
                  v-model="asset.asset_name"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="ยี่ห้อ"
                  variant="outlined"
                  v-model="asset.brand"
                  density="compact"
                  readonly
                  v-if="asset.brand"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="รุ่น"
                  variant="outlined"
                  v-model="asset.model"
                  density="compact"
                  readonly
                  v-if="asset.model"
                />
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  label="เลือกลูกค้า"
                  :model-value="
                    selectedCustomer
                      ? `${selectedCustomer.customer_firstname} ${selectedCustomer.customer_lastname}`
                      : ''
                  "
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" sm="12">
                <v-radio-group
                  v-model="initial_deposit_method"
                  label="เลือกวิธีการเก็บเงิน"
                  density="compact"
                  required
                >
                  <v-radio label="โอน" value="โอน" />
                  <v-radio label="เงินสด" value="เงินสด" />
                </v-radio-group>
              </v-col>
              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="expected_deposit_amount"
                  label="เรียกเก็บเงินทั้งหมด"
                  variant="outlined"
                  density="compact"
                  suffix="บาท"
                />
              </v-col>
              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="initial_deposit_paid"
                  label="จำนวนเงินมัดจำรอบแรก"
                  variant="outlined"
                  density="compact"
                  suffix="บาท"
                />
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="initial_deposit_date"
                  label="วันที่เก็บเงินรอบแรก"
                  variant="outlined"
                  density="compact"
                  type="date"
                />
              </v-col>
              <v-col cols="6" sm="6">
                <v-file-input
                  v-model="slip"
                  label="แนบสลิปเงินมัดจำ"
                  accept=".jpg,.jpeg,.png,.pdf"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-paperclip"
                />
              </v-col>
              <v-col cols="6" sm="6">
                <v-file-input
                  v-model="idcard"
                  label="แนบสำเนาบัตรประชาชน"
                  accept=".jpg,.jpeg,.png,.pdf"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-paperclip"
                />
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="manual_address"
                  label="ที่อยู่จัดส่ง"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="map_url"
                  label="แนบลิ้ง google_map"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn
                  color="green"
                  size="large"
                  variant="elevated"
                  @click="submitRequest"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  บันทึกคำขอยืม
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
          <v-alert type="warning" v-else>
            ไม่พบข้อมูลทรัพย์สิน กรุณากลับไปเลือกใหม่
          </v-alert>
        </v-col>

        <!-- ฝั่งขวา: รายชื่อลูกค้า -->
        <v-col cols="12" md="5">
          <v-card class="pa-4 h-100">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3>เลือกลูกค้าที่จะยืม</h3>
              <v-btn
                color="success"
                variant="elevated"
                size="small"
                @click="openAddCustomerDialog"
              >
                <v-icon start>mdi-account-plus</v-icon>
                เพิ่มลูกค้า
              </v-btn>
            </div>

            <!-- ช่องค้นหา -->
            <v-text-field
              v-model="search"
              label="ค้นหาลูกค้า"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              class="mb-4"
            />

            <!-- รายชื่อลูกค้า -->
            <v-list
              lines="three"
              density="comfortable"
              style="max-height: 400px; overflow-y: auto"
            >
              <v-list-item
                v-for="customer in filteredCustomers"
                :key="customer.customer_id"
                @click="selectCustomer(customer)"
                class="hover:bg-green-100 cursor-pointer rounded mb-1"
              >
                <v-list-item-title>
                  {{ customer.customer_firstname }}
                  {{ customer.customer_lastname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ customer.customer_phone }}<br />
                  {{ customer.customer_address }},
                  {{ customer.customer_district }},
                  {{ customer.customer_province }}
                  {{ customer.customer_zipcode }}
                </v-list-item-subtitle>
              </v-list-item>

              <!-- กรณีไม่พบลูกค้า -->
              <v-list-item v-if="filteredCustomers.length === 0">
                <v-list-item-title class="text-red-500"
                  >ไม่พบลูกค้า</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <!-- Dialog เพิ่มลูกค้า -->
      <v-dialog v-model="addCustomerDialog" max-width="600">
        <v-card>
          <v-card-title>
            <h2>เพิ่มลูกค้าใหม่</h2>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row dense>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_firstname"
                    label="ชื่อจริง"
                    required
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_lastname"
                    label="นามสกุล"
                    required
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_phone"
                    label="เบอร์โทร"
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="newCustomer.customer_address"
                    label="ที่อยู่"
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_district"
                    label="ตำบล/แขวง"
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_province"
                    label="จังหวัด"
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="12">
                  <v-text-field
                    v-model="newCustomer.customer_zipcode"
                    label="รหัสไปรษณีย์"
                    outlined
                    dense
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text @click="addCustomerDialog = false">ยกเลิก</v-btn>
            <v-btn color="primary" @click="submitNewCustomer">บันทึก</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { computed, ref, onMounted } from "vue";
import { useAssetStore } from "@/stores/assetStore";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();

const assetStore = useAssetStore();
const asset = computed(() => assetStore.selectedAsset);

// รายชื่อลูกค้า mock สำหรับตัวอย่าง
const search = ref("");
const customers = ref([]);

const fetchCustomers = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4512/api/customer/getcustomer"
    );
    if (res.data.status === "success") {
      customers.value = res.data.data;
    } else {
      console.error("ไม่สามารถโหลดลูกค้าได้:", res.data.message);
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการโหลดลูกค้า:", err);
  }
};

onMounted(() => {
  fetchCustomers();
});

const filteredCustomers = computed(() => {
  if (!search.value) return customers.value;

  const keyword = search.value.toLowerCase();
  return customers.value.filter((c) =>
    `${c.customer_firstname} ${c.customer_lastname} ${c.customer_phone}`
      .toLowerCase()
      .includes(keyword)
  );
});

const selectedCustomer = ref(null);
const selectCustomer = (customer) => {
  selectedCustomer.value = customer;
  console.log("เลือก:", customer);
};

//บันทึกคำขอยืม
const slip = ref(null);
const idcard = ref(null);
const manual_address = ref("");
const map_url = ref("");
const initial_deposit_method = ref("");
const expected_deposit_amount = ref("");
const initial_deposit_paid = ref("");
const initial_deposit_date = ref("");

const submitRequest = async () => {
  if (!selectedCustomer.value || !asset.value) {
    await Swal.fire({
      icon: "warning",
      title: "ข้อมูลไม่ครบ",
      text: "กรุณาเลือกลูกค้าและทรัพย์สินให้ครบก่อนบันทึก",
    });
    return;
  }

  const formData = new FormData();
  formData.append("customer_id", selectedCustomer.value.customer_id);
  formData.append("asset_id", asset.value.asset_id);
  formData.append("map_url", map_url.value);
  formData.append("manual_address", manual_address.value);
  formData.append("initial_deposit_method", initial_deposit_method.value);
  formData.append("expected_deposit_amount", expected_deposit_amount.value);
  formData.append("initial_deposit_paid", initial_deposit_paid.value);
  formData.append("initial_deposit_date", initial_deposit_date);

  if (slip.value) formData.append("slip", slip.value);
  if (idcard.value) formData.append("idcard", idcard.value);

  try {
    const res = await axios.post(
      "http://localhost:4512/api/customer/createBorrowcustomerRequest",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (res.data.status === "success") {
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกคำขอยืมเรียบร้อยแล้ว",
        timer: 2000,
        showConfirmButton: false,
      });
      assetStore.clearSelectedAsset();
      // (ถ้าต้อง reset ฟอร์มหลังบันทึกเสร็จ สามารถเพิ่มได้ที่นี่)
      router.push("/addassetsetting");
    } else {
      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถบันทึกได้",
        text: res.data.message || "กรุณาลองใหม่อีกครั้ง",
      });
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  }
};

//เพิ่มลูกค้า

const openAddCustomerDialog = () => {
  console.log("เปิดหน้าหรือ dialog เพิ่มลูกค้า");
  newCustomer.value = {
    customer_firstname: "",
    customer_lastname: "",
    customer_phone: "",
    customer_address: "",
    customer_district: "",
    customer_province: "",
    customer_zipcode: "",
  };
  addCustomerDialog.value = true;
};

const addCustomerDialog = ref(false);
const newCustomer = ref({
  customer_firstname: "",
  customer_lastname: "",
  customer_phone: "",
  customer_address: "",
  customer_district: "",
  customer_province: "",
  customer_zipcode: "",
});

const submitNewCustomer = async () => {
  try {
    const res = await axios.post(
      "http://localhost:4512/api/customer/addcustomer",
      newCustomer.value
    );

    if (res.data.status === "success") {
      addCustomerDialog.value = false;

      await Swal.fire({
        icon: "success",
        title: "เพิ่มลูกค้าเรียบร้อย",
        timer: 1500,
        showConfirmButton: false,
      });
      addCustomerDialog.value = false;
      fetchCustomers(); // รีเฟรชรายการลูกค้า
    } else {
      throw new Error(res.data.message || "เกิดข้อผิดพลาดในการเพิ่ม");
    }
  } catch (err) {
    console.error("เพิ่มลูกค้าล้มเหลว:", err);
    await Swal.fire({
      icon: "error",
      title: "ผิดพลาด",
      text: err.message || "ไม่สามารถเพิ่มลูกค้าได้",
    });
  }
};
</script>
