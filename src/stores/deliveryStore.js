// stores/deliveryStore.js
import { defineStore } from 'pinia'

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    selectedItem: null,
  }),

  actions: {
    setSelectedItem(item) {
      this.selectedItem = item
      localStorage.setItem('selectedDeliveryItem', JSON.stringify(item))
    },

    loadSelectedItem() {
      const stored = localStorage.getItem('selectedDeliveryItem')
      this.selectedItem = stored ? JSON.parse(stored) : null
    },

    clearSelectedItem() {
      this.selectedItem = null
      localStorage.removeItem('selectedDeliveryItem')
    }
  }
})