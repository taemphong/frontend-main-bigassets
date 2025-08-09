<template>
  <Layout>
    <h1>ตรวจสอบทรัพย์สิน</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="10" class="mx-auto mt-5">
            <QrScanner/>
    </v-col>
    </v-row>
    </v-container>
  </Layout>
</template>

<script setup>
import Layout from '@/components/AssetsLayout.vue';
import QrScanner from '@/views/A_QRscan.vue'


</script>