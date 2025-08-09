const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

    pages: {
    index: {
      entry: 'src/main.js', 
      title: 'ระบบบริหารทรัพย์สิน ' 
    }
  },


  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
})
