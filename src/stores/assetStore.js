import { defineStore } from 'pinia'

export const useAssetStore = defineStore('asset', {
  state: () => ({
    selectedAsset: JSON.parse(localStorage.getItem('selectedAsset')) || null
  }),
  actions: {
    setSelectedAsset(asset) {
      this.selectedAsset = asset
      localStorage.setItem('selectedAsset', JSON.stringify(asset))
    },
    clearSelectedAsset() {
      this.selectedAsset = null
      localStorage.removeItem('selectedAsset')
    }
  }
})
