import { createRouter, createWebHashHistory } from "vue-router";

import A_Login from "@/views/A_Login.vue";
import A_Home from "@/views/A_Home.vue";
import A_Addassets from "@/views/A_Addassets.vue";
import A_employee from "@/views/A_employee.vue";
import A_assetSetting from "@/views/A_assetSetting.vue";
import A_depreciation from "@/views/A_depreciation.vue";
import A_Dashboard from "@/views/A_Dashboard.vue";
import A_FixdAsset from "@/views/A_FixdAsset.vue";
import A_Borrow from "@/views/A_Borrow.vue";
import Admin_request from "@/views/Admin_request.vue";
import A_borrow_history from "@/views/A_borrow_history.vue";
import M_maintenance from "@/views/M_maintenance.vue";
import M_reportMaintenance from "@/views/M_reportMaintenance.vue";
import Admin_Setpermission from "@/views/Admin_Setpermission.vue";
import A_customerBorrow from "@/views/A_customerBorrow.vue";
import A_Trackingasset from "@/views/A_Trackingasset.vue";
import A_Customer_borrow_request from "@/views/A_Customer_borrow_request.vue";

const routes = [
  { path: "/", name: "A_Login", component: A_Login },
  { path: "/home", name: "A_home", component: A_Home },
  { path: "/addassets", name: "A_Addassets", component: A_Addassets },
  {
    path: "/addassetsetting",
    name: "A_assetSetting",
    component: A_assetSetting,
  },
  { path: "/employee", name: "A_employee", component: A_employee },
  { path: "/depreciation", name: "A_depreciation", component: A_depreciation },
  { path: "/dashboard", name: "A_Dashboard", component: A_Dashboard },
  { path: "/fixdasset", name: "A_FixdAsset", component: A_FixdAsset },
  { path: "/borrowasset", name: "A_Borrow", component: A_Borrow },
  { path: "/adminrequest", name: "Admin_request", component: Admin_request },
  { path: "/borrowhistory", name: "A_borrow_history", component: A_borrow_history },
  { path: "/maintenance", name: "M_maintenance", component: M_maintenance },
  { path: "/reportmaintenance", name: "M_reportMaintenance", component: M_reportMaintenance },
  { path: "/adminSetpermission", name: "Admin_Setpermission", component: Admin_Setpermission },
  { path: "/customerborrow", name: "A_customerBorrow", component: A_customerBorrow },
  { path: "/trackingasset", name: "A_Trackingasset", component: A_Trackingasset },
  { path: "/customer_request", name: "A_Customer_borrow_request", component: A_Customer_borrow_request },

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
