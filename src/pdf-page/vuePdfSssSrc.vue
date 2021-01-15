<style src="./annotationLayer.css"></style>
<script>

	import componentFactory from './componentFactory'
	import pdfjsWrapper from './pdfjsWrapper'

	var PDFJS = require('pdfjs-dist/es5/build/pdf.js');

	if ( process.env.VUE_ENV !== 'server' ) {

		if ( typeof window !== 'undefined' && 'Worker' in window ) {
      PDFJS.GlobalWorkerOptions.workerSrc= __webpack_public_path__ + 'js/pdf.worker.js';
      debugger
		}
	}

	var component = componentFactory(pdfjsWrapper(PDFJS));
	component.PDFJS = PDFJS;

	export default component;

</script>