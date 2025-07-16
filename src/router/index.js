import { createRouter, createWebHashHistory } from "vue-router";

import A_Login from "@/views/A_Login.vue";
import A_Home from "@/views/A_Home.vue";
import A_Addassets from "@/views/A_Addassets.vue";

const routes = [
   { path: '/', name: 'A_Login', component: A_Login },
   { path: '/home', name: 'A_home', component: A_Home },
   { path: '/addassets', name: 'A_Addassets', component: A_Addassets },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router