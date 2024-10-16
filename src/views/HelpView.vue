<template>
  <div v-html="htmlContent"></div>
</template>

<script>
export default {
  name: "HelpView",
  data() {
    return {
      htmlContent: ''
    };
  },
  async created() {
    try {
      const response = await fetch(' /help/help.html');
      this.htmlContent = await response.text();
    } catch (error) {
      console.error('Error loading HTML file:', error);
    }
  }
}
</script>

<style scoped>

</style>
