<template>
	<div id="app">
		<PdfViewer v-bind="query" />
	</div>
</template>
<script>
import { PdfViewer, parseQueryString } from '../../src';

export default {
	components: {
		PdfViewer,
  },
  data() {
    // http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg3_7x-wUorfn9iwY.pdf
    // http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg2_7x-wUowamVtgE.pdf
    // http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg2O7x-wUoteDI4wI.pdf
    // http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg1_7x-wUo8PaxsQI.pdf
    const query = parseQueryString(document.location.search.slice(1));

    return {
      query
    };
  }
}
</script>

<style>
html, 
body,
#app {
  height: 100%;
  padding: 0;
  margin: 0;
}
</style>
