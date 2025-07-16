<template>
  <v-app >
    <v-main >
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',


  data: () => ({
    //
  }),
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap');

body {
  font-family: 'Kanit', sans-serif;
  font-weight: 300;
}
</style>