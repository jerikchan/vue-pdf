<template>
	<div id="app">
		<div class="pdf-content-wrapper">
      <div class="pdf-page-container">
        <div 
          class="pdf-page" 
          v-for="i in numPages"
          :key="i"
        >
          <pdf :src="src" :page="i" ></pdf>
        </div>
      </div>
		</div>
    <!-- <div class="pdf-bar">
      <div class="pdf-bar-group-left">
        <div class="pdf-bar-page-number">页码</div>
      </div>
      <div class="pdf-bar-group-right">100%</div>
    </div> -->
	</div>
</template>
<script>
import pdf from '../../src/vuePdfSss'

// http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg3_7x-wUorfn9iwY.pdf
// http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg2_7x-wUowamVtgE.pdf
// http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg2O7x-wUoteDI4wI.pdf
// http://9850206.s21d-9.aaadns.com/61/6/ABUIABA9GAAg1_7x-wUo8PaxsQI.pdf

const DEFAULT_OPTIONS = {
  file: '',
};
const searchParams = document.location.search && document.location.search.slice(1).split("&").reduce((acc, cur) => { 
  const params = cur.split('=');
  acc[params[0]] = decodeURIComponent(params[1]);
  return acc;
}, {});
const options = {
  ...DEFAULT_OPTIONS,
  ...searchParams && { ...searchParams },
};

const loadingTask = options.file && pdf.createLoadingTask(options.file);

export default {
	components: {
		pdf,
	},
	data () {
		return {
      src: loadingTask,
			loadedRatio: 0,
			page: 1,
			numPages: 0,
		}
	},
	methods: {
		error: function(err) {
			console.log(err);
		}
  },
  mounted() {
    debugger
    this.src && this.src.promise.then(pdf => {
      this.numPages = pdf.numPages;
    });
  }
}
</script>

<style>
html, 
body {
  height: 100%;
  padding: 0;
  margin: 0;
}
#app {
  height: 100%;
}
.pdf-content-wrapper {
  background: #fafafa;
  /* height: calc(100% - 30px); */
  height: 100%;
  text-align: center;
  overflow: auto;
}
.pdf-page-container {
  /* display: inline-block; */
  max-width: 960px;
  margin: 0 auto;
}
.pdf-page {
  margin: 20px 30px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
}
.pdf-bar {
  height: 30px;
  background: #f2f4f7;
  box-shadow: 0 -1px 0 0 #d3d3d3;
  cursor: default;
}
.pdf-bar-group-left {
  float: left;
  height: 100%;
}
.pdf-bar-group-right {
  float: right;
  height: 100%;
}
</style>
