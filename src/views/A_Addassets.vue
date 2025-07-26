<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="8" class="mx-auto mt-12">
          <!-- Tabs Menu -->
          <v-card class="mb-4">
            <v-tabs v-model="tab" background-color="white" color="red" grow>
              <v-tab> เพิ่มรายการทรัพย์สิน</v-tab>
              <v-tab>แนบไฟล์</v-tab>
            </v-tabs>
          </v-card>

          <!-- Tab Content -->
          <v-window v-model="tab">
            <!-- ข้อมูลทั่วไป -->
            <v-window-item :value="0">
              <v-card class="pa-4 mb-4">
                <v-row dense="">
                  <v-col cols="12" md="4">
                    <div class="d-flex align-center" style="gap: 8px">
                      <v-select
                        label="ประเภททรัพย์สิน"
                        v-model="type_id"
                        :items="types"
                        item-title="type_name"
                        item-value="type_id"
                        variant="outlined"
                        density="compact"
                        style="flex: 1"
                        @update:model-value="
                          (val) => console.log('เลือก type_id:', val)
                        "
                      ></v-select>
                      <v-btn
                        icon
                        size="small"
                        color="success"
                        style="min-width: 36px; height: 36px"
                        class="mt-n6"
                        @click="addTypeDialog = true"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
                <v-row dense="">
                  <v-col cols="12" md="4">
                    <div class="d-flex align-center" style="gap: 8px">
                      <v-select
                        label="สถานที่เก็บ"
                        prepend-inner-icon="mdi-map-marker"
                        v-model="location_id"
                        :items="locations"
                        item-title="location_name"
                        item-value="location_id"
                        variant="outlined"
                        density="compact"
                        style="flex: 1"
                        placeholder="เลือกสถานที่เก็บ"
                      ></v-select>
                      <v-btn
                        icon
                        size="small"
                        color="success"
                        style="min-width: 36px; height: 36px"
                        class="mt-n6"
                        @click="addlocation = true"
                      >
                        <v-icon>mdi-map-marker-plus</v-icon>
                      </v-btn>
                    </div>
                    <div
                      v-if="selectedLocation"
                      class="d-flex flex-column gap-2"
                    >
                      <v-text-field
                        label="ชื่อสถานที่"
                        :model-value="selectedLocation.location_name"
                        variant="outlined"
                        readonly
                        density="compact"
                      />
                      <v-text-field
                        label="ประเภท"
                        :model-value="selectedLocation.location_type"
                        variant="outlined"
                        readonly
                        density="compact"
                      />
                      <v-text-field
                        label="ที่อยู่"
                        :model-value="selectedLocation.address"
                        variant="outlined"
                        readonly
                        density="compact"
                      />
                    </div>
                  </v-col>
                </v-row>
                <v-row dense="">
                  <v-col cols="12" md="8">
                    <div class="d-flex align-center" style="gap: 8px">
                      <v-text-field
                        label="โซนจัดเก็บ"
                         variant="outlined"
                        v-model="zone"
                        density="compact"
                      ></v-text-field>
                      <v-text-field
                        label="จุดใช้งาน"
                         variant="outlined"
                        v-model="use_zone"
                        density="compact"
                      ></v-text-field>
                      <v-text-field
                        label="ห้อง"
                         variant="outlined"
                        v-model="room_zone"
                        density="compact"
                      ></v-text-field>
                    </div>
                  </v-col>
                </v-row>
                <v-row dense="">
                  <v-col cols="12" md="6">
                    <v-text-field
                      label="ชื่อทรัพย์สิน"
                      variant="outlined"
                      v-model="asset_name"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      label="ยี่ห้อ"
                      variant="outlined"
                      v-model="brand"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      label="รุ่น"
                      variant="outlined"
                      v-model="model"
                      density="compact"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      label="วันที่รับเข้า"
                      variant="outlined"
                      v-model="purchase_date"
                      type="date"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      label="วันหมดประกัน"
                      variant="outlined"
                      v-model="warranty_expire"
                      type="date"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      label="ราคาซื้อ"
                      v-model="purchase_price"
                      variant="outlined"
                      density="compact"
                      suffix="บาท"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      label="รับผิดชอบโดย"
                      variant="outlined"
                      v-model="employee_id"
                      density="compact"
                      :items="employees"
                      :item-title="
                        (item) => `${item.first_name} ${item.last_name}`
                      "
                      item-value="employee_id"
                      placeholder="เลือกพนักงาน"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      label="สถานะ"
                      variant="outlined"
                      v-model="status_id"
                      :items="statuses"
                      item-title="status_name"
                      item-value="status_id"
                      density="compact"
                    ></v-select>
                  </v-col>
                  <!-- เพิ่มเติมประเภทรถ -->
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="ทะเบียนรถ"
                      v-model="license_plate"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="เลขเครื่องยนต์"
                      v-model="engine_no"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="เลขตัวถัง"
                      v-model="chassis_no"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                   <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="วันที่จดทะเบียน"
                      v-model="registered_date"
                      variant="outlined"
                      density="compact"
                      type="date"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="วันหมดอายุภาษี"
                      v-model="tax_due_date"
                      variant="outlined"
                      density="compact"
                      type="date"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="วันหมดอายุประกันภัย"
                      v-model="insurance_due_date"
                      variant="outlined"
                      density="compact"
                      type="date"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="บริษัทประกันภัย"
                      v-model="insurance_provider"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                   <v-col cols="12" md="4">
                    <v-text-field
                      v-if="selectedTypeName === 'ทรัพย์สินประเภทรถ'"
                      label="เลขกรมธรรม์"
                      v-model="insurance_policy_no"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
               
                </v-row>
              </v-card>
              <v-card class="pa-4 mb-4">
                <v-row>
                  <!-- ฝั่ง input -->
                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="image"
                      label="ลากและวางไฟล์ที่นี่ หรือเลือกไฟล์"
                      prepend-icon="mdi-camera"
                      variant="outlined"
                      accept="image/*"
                      capture="environment"
                      show-size
                      style="
                        border: 2px dashed #ccc;
                        padding: 30px;
                        text-align: center;
                      "
                      @change="onFileChange"
                    ></v-file-input>
                  </v-col>

                  <!-- ฝั่ง preview -->
                  <v-col
                    cols="12"
                    md="6"
                    class="d-flex align-center justify-center"
                  >
                    <v-img
                      v-if="imagePreview"
                      :src="imagePreview"
                      aspect-ratio="1"
                      max-width="300"
                      max-height="300"
                      class="rounded-lg"
                    ></v-img>
                    <div v-else class="text-center text-grey">
                      ยังไม่มีรูปภาพ
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-window-item>

            <!-- แนบไฟล์ -->
            <v-window-item :value="1">
              <v-card class="pa-4 mb-4">
                <div class="text-subtitle-1 font-weight-bold mb-2">แนบไฟล์</div>
                <v-row>
                  <v-col cols="12" md="3">
                    <h2>แนบไฟล์คู่มือ</h2>
                  </v-col>
                </v-row>
              </v-card>
            </v-window-item>
          </v-window>

          <!-- ปุ่ม -->
          <v-row class="justify-center mb-4 mt-4">
            <v-btn
              class="mr-2"
              color="primary"
              variant="flat"
              @click="submitAsset"
            >
              บันทึกและปิด
            </v-btn>
            <v-btn class="mr-2" color="secondary" variant="flat"
              >บันทึกและพิมพ์</v-btn
            >
            <v-btn color="error" variant="flat">ลบข้อมูล</v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <!-- //ไดอาล็อคเพิ่มประเภท -->
    <v-dialog v-model="addTypeDialog" max-width="500">
      <v-card>
        <v-card-title>
          <span>เพิ่มประเภททรัพย์สินใหม่</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              label="รหัสบริษัท"
              variant="outlined"
              v-model="company_code"
            />
            <v-text-field
              label="รหัสประเภท"
              variant="outlined"
              v-model="type_prefix"
            />
            <v-text-field
              label="ชื่อประเภททรัพย์สิน"
              variant="outlined"
              v-model="type_name"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text color="red" @click="addTypeDialog = false">ยกเลิก</v-btn>
          <v-btn text color="green" @click="addType"> บันทึก </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ไดอาล็อกสถานที่ -->
    <v-dialog v-model="addlocation" max-width="600">
      <v-card prepend-icon="mdi-map-marker" title="เพิ่มสถานที่เก็บ">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                label="ชื่อสถานที่ "
                v-model="form.location_name"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="ประเภท "
                v-model="form.location_type"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                label="ที่อยู่ "
                v-model="form.address"
                required
                variant="outlined"
                density="compact"
              ></v-textarea>
            </v-col>
          </v-row>

          <small class="text-caption text-medium-emphasis"
            >*จำเป็นต้องกรอก</small
          >
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="ยกเลิก"
            variant="plain"
            @click="addlocation = false"
          ></v-btn>

          <v-btn
            color="primary"
            text="บันทึก"
            variant="tonal"
            @click="submitForm"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </Layout>
</template>

<script setup>
import Layout from "@/components/AssetsLayout.vue";
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const tab = ref(0);

//ข้อมูลทั้งหมด
const type_id = ref(null);
const asset_name = ref("");
const brand = ref("");
const model = ref("");
const employee_id = ref(null);
const location_id = ref(null);
const purchase_date = ref("");
const warranty_expire = ref("");
const purchase_price = ref("");
const useful_life = ref("");
const salvage_percent = ref("");
const manual_salvage_value = ref("");
const status_id = ref(null);
const depreciation_method = ref("");
const image = ref(null);
const zone = ref("");
const use_zone = ref("");
const room_zone = ref("");

//ข้อมูลเพิ่มเติมสำหรับประเภททรัพย์สิน "ทรัพย์สินประเภทรถ"
const license_plate = ref("");
const engine_no = ref("");
const chassis_no = ref("");
const registered_date = ref("");
const tax_due_date = ref("");
const insurance_due_date = ref("");
const insurance_provider = ref("");
const insurance_policy_no = ref("");


// ฟังก์ชัน reset ฟอร์ม
const resetForm = () => {
  type_id.value = null;
  asset_name.value = "";
  brand.value = "";
  model.value = "";
  employee_id.value = null;
  location_id.value = null;
  purchase_date.value = "";
  warranty_expire.value = "";
  purchase_price.value = "";
  useful_life.value = "";
  salvage_percent.value = "";
  manual_salvage_value.value = "";
  status_id.value = null;
  depreciation_method.value = "";
  image.value = null;
  zone.value = "";
  use_zone.value = "";
  room_zone.value = "";
  // ข้อมูลเพิ่มเติมสำหรับประเภททรัพย์สิน "ทรัพย์สินประเภทรถ"
  license_plate.value = "";
  engine_no.value = "";
  chassis_no.value = "";
  registered_date.value = "";
  tax_due_date.value = "";
  insurance_due_date.value = "";
  insurance_provider.value = "";
  insurance_policy_no.value = "";
};
// ฟังก์ชันเพิ่มข้อมูล
const submitAsset = async () => {
  try {
    const formData = new FormData();
    formData.append("type_id", type_id.value);
    formData.append("asset_name", asset_name.value);
    formData.append("brand", brand.value);
    formData.append("model", model.value);
    formData.append("employee_id", employee_id.value);
    formData.append("location_id", location_id.value);
    formData.append("purchase_date", purchase_date.value);
    formData.append("warranty_expire", warranty_expire.value);
    formData.append("purchase_price", purchase_price.value);
    formData.append("status_id", status_id.value);
    formData.append("zone", zone.value);
    formData.append("use_zone", use_zone.value);
    formData.append("room_zone", room_zone.value);
    // ข้อมูลเพิ่มเติมสำหรับประเภททรัพย์สิน "ทรัพย์สินประเภทรถ"
    formData.append("license_plate", license_plate.value);
    formData.append("engine_no", engine_no.value);
    formData.append("chassis_no", chassis_no.value);
    formData.append("registered_date", registered_date.value);
    formData.append("tax_due_date", tax_due_date.value);
    formData.append("insurance_due_date", insurance_due_date.value);
    formData.append("insurance_provider", insurance_provider.value);
    formData.append("insurance_policy_no", insurance_policy_no.value);
    // แนบรูปภาพถ้ามี
    if (image.value) {
      formData.append("image", image.value);
    }

    const response = await axios.post(
      "http://localhost:4512/api/asset/addassets",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("เพิ่มสินทรัพย์สำเร็จ", response.data);
    Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลสำเร็จ!",
      text: "ระบบบันทึกข้อมูลทรัพย์สินเรียบร้อยแล้ว",
      confirmButtonText: "ตกลง",
    }).then(() => {
      resetForm();
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึก", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถบันทึกข้อมูล กรุณาลองใหม่",
      confirmButtonText: "ตกลง",
    });
  }
};

// ส่วนของประเภทสินทรัพย์
const types = ref([]); // เก็บข้อมูล list ที่ดึงจาก API
const addTypeDialog = ref(false);
const type_prefix = ref("");
const type_name = ref("");
const company_code = ref("");

const fetchTypes = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/asset/gettype"
    );
    if (data.status === "success") {
      types.value = data.result;
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  }
};

onMounted(() => {
  fetchTypes();
});

const addType = async () => {
  if (!type_prefix.value || !type_name.value || !company_code.value) {
    Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:4512/api/asset/addassettype",
      {
        type_prefix: type_prefix.value,
        type_name: type_name.value,
        company_code: company_code.value,
      }
    );

    if (res.data.status === "success") {
      Swal.fire("สำเร็จ", "เพิ่มประเภททรัพย์สินเรียบร้อยแล้ว", "success");
      addTypeDialog.value = false;
      type_prefix.value = "";
      type_name.value = "";
      fetchTypes();
    } else {
      Swal.fire(
        "ผิดพลาด",
        res.data.message || "ไม่สามารถเพิ่มข้อมูลได้",
        "error"
      );
    }
  } catch (error) {
    console.error(error);
    Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", "error");
  }
};

// จบส่วนของประเภททรัพย์สิน//////////////////////////////////////////////////////////////////////

// ส่วนของโลเคชั่น

const locations = ref([]);
const addlocation = ref(false);

const form = ref({
  location_name: "",
  location_type: "",
  address: "",
});

const submitForm = async () => {
  try {
    const res = await axios.post(
      "http://localhost:4512/api/location/addlocation",
      form.value
    );
    console.log("เพิ่มข้อมูลสำเร็จ", res.data);

    Swal.fire({
      icon: "success",
      title: "เพิ่มข้อมูลสำเร็จ!",
      text: "บันทึกสถานที่เก็บเรียบร้อย",
      timer: 1500,
      showConfirmButton: false,
    });

    addlocation.value = false;
    form.value = {
      location_name: "",
      location_type: "",
      address: "",
    };
    fetchLocations();
  } catch (err) {
    console.error("เกิดข้อผิดพลาด", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    });
  }
};

const fetchLocations = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/location/getlocation"
    );
    if (data.status === "success") {
      locations.value = data.result;
    } else {
      console.error("ดึงข้อมูลล้มเหลว", data.message);
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  }
};

const selectedLocation = computed(() => {
  return locations.value.find((item) => item.location_id === location_id.value);
});

onMounted(() => {
  fetchLocations();
});
////////////////////////////////////////////////////////////////////

//ส่วนของพนักงาน

const employees = ref([]);

const fetchEmployees = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/employee/getAllEmployees"
    );
    if (data.status === "success") {
      employees.value = data.result;
    }
  } catch (err) {
    console.error("ดึงข้อมูลพนักงานล้มเหลว", err);
  }
};

onMounted(() => {
  fetchEmployees();
});

//ส่่วนของstatus

const statuses = ref([]);

const fetchStatus = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:4512/api/asset/getstatus"
    );
    if (data.status === "success") {
      statuses.value = data.result;
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  }
};

onMounted(() => {
  fetchStatus();
});

///////////////////////////////////////////////

// คำนวณหาราคาเสื่อม

//previewรูปภาพ
const imagePreview = ref("");

const onFileChange = () => {
  if (image.value) {
    const file = image.value;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    imagePreview.value = "";
  }
};

// ล้าง memory URL เมื่อเปลี่ยนภาพ
watch(image, (newVal, oldVal) => {
  if (oldVal) URL.revokeObjectURL(imagePreview.value);
});

const selectedTypeName = computed(() => {
  const selected = types.value.find((t) => t.type_id === type_id.value);
  return selected?.type_name || "";
});
</script>
