<template>
	<div class="pdf-viewer" ref="viewer" :class="{ 'is-fullscreen': isFullscreenMode }" @fullscreenchange="onFullscreenchange" @fullscreenerror="onFullscreenerror">
		<div ref="scrollContainer" class="pdf-viewer--content-wrapper">
      <div v-show="loading || isError" class="pdf-viewer-spin">
        <svg v-show="loading" class="pdf-viewer-spin--icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke="currentColor" viewBox="0 0 16 16">
          <path d="M13.5,8A5.5,5.5,0,1,1,8,2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="pdf-viewer-spin--label">{{ isError ? errorMessage : ratio + '%' }}</span>
      </div>
      <div class="pdf-viewer--page-container">
        <div 
          ref="page"
          class="pdf-viewer--page" 
          v-for="i in numPages"
          :key="i"
        >
          <PdfPage :src="src" :page="i" />
        </div>
      </div>
		</div>
    <div class="pdf-viewer-bar">
      <div class="pdf-viewer-bar--group-left">
        <div class="pdf-viewer-bar--page-number">{{ currentPageNumber }}/{{ numPages }}</div>
      </div>
      <div class="pdf-viewer-bar--group-right">
        <div class="pdf-viewer-bar--zomm"></div>
        <div class="pdf-viewer-bar--fullscreen" :class="{ 'is-disabled': !realFullscreenEnabled }" :title="fullscreenEnabledTitle" @click="toggleFullScreen">
          <svg class="pdf-viewer-bar--fullscreen-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13">
            <path d="M1,11H2v1H4v1H0V9H1Zm1,0H3V10H2Zm1-1H4V9H3ZM4,8V9H5V8Zm8,1v2H11v1H9v1h4V9Zm-1,1H10v1h1ZM10,9H9v1h1ZM9,8H8V9H9ZM2,2V3H3V2ZM4,4V5H5V4ZM3,3V4H4V3ZM4,1V0H0V4H1V2H2V1ZM8,5H9V4H8ZM9,0V1h2V2h1V4h1V0Zm1,3h1V2H10ZM9,4h1V3H9Z" fill="#4d4d4d"/>
          </svg>
          <svg class="pdf-viewer-bar--exit-fullscreen-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
            <path d="M0,11H1v1H0Zm11,0h1v1H11ZM11,0h1V1H11ZM10,1h1V2H10ZM5,7v5H4V9H3V8H0V7ZM2,9v1H3V9ZM1,10v1H2V10ZM7,7v5H8V9H9V8h3V7Zm2,3h1V9H9Zm1,1h1V10H10Zm0-9H9V3h1ZM3,2V3H2V2ZM2,1V2H1V1ZM1,1V0H0V1ZM9,4V3H8V0H7V5h5V4ZM4,3H3V4H0V5H5V0H4Z" fill="#464646"/>
          </svg>
          {{ isFullscreenMode ? '退出全屏' : '' }}
        </div>
      </div>
    </div>
	</div>
</template>

<script>
import PdfPage from '../pdf/vuePdfNoSss'
import { watchScroll, getVisibleElements } from '../utils'

export default {
	components: {
    PdfPage,
  },
  props: {
    file: {
      type: String,
      default: '',
    },
    fullscreenEnabled: {
      type: Boolean,
      default: true
    }
  },
	data () {
		return {
      src: this.createLoadingTask(),
			ratio: 0,
      currentPageNumber: 0,
      numPages: 0,
      isFullscreenMode: false,
      loading: true,
      isError: false,
		};
  },
  computed: {
    realFullscreenEnabled() {
      return document.fullscreenEnabled && this.fullscreenEnabled;
    },
    fullscreenEnabledTitle() {
      return this.realFullscreenEnabled ? null : '当前模式下不支持全屏操作'
    }
  },
  watch: {
    file() {
      this.src = this.createLoadingTask();
    },
    src() {
      this.processTaskLoaded();
    }
  },
	methods: {
    logError(err) {
      this.isError = true;
      this.errorMessage = err.message;
      console.error('[PDFViewer]', err);
      this.$emit('error', err);
    },
    createLoadingTask() {
      const loadingTask = this.file ? PdfPage.createLoadingTask(this.file, {
        onProgress: this.onProgress
      }) : null;
      return loadingTask;
    },
    onFullscreenchange() {
      this.isFullscreenMode = document.fullscreenElement ? true : false;
    },
    onFullscreenerror(err) {
      this.logError(err);
    },
    onProgress(status) {
      this.ratio = Math.min(Math.floor(status.loaded / status.total * 100), 100);
    },
    toggleFullScreen() {
      if (this.realFullscreenEnabled) {
        if (!document.fullscreenElement) {
            if (this.$refs.viewer) {
              this.$refs.viewer.requestFullscreen();
            }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    },
    scrollUpdate() {
      const visible = getVisibleElements({
        scrollEl: this.$refs.scrollContainer,
        views: this._pages,
        sortByVisibility: true,
      });

      const visiblePages = visible.views,
        numVisiblePages = visiblePages.length;

      if (numVisiblePages === 0) {
        return;
      }

      let currentId = this.currentPageNumber;
      let stillFullyVisible = false;

      for (const page of visiblePages) {
        if (page.percent < 100) {
          break;
        }

        if (page.id === currentId) {
          stillFullyVisible = true;
          break;
        }
      }

      if (!stillFullyVisible) {
        currentId = visiblePages[0].id;
      }

      this.currentPageNumber = currentId;
    },
    initPages() {
      if (this.$refs.page) {
        this._pages = this.$refs.page.map((div, index) => {
          return {
            id: index + 1,
            div,
          };
        });
        const visible = watchScroll(this.$refs.scrollContainer, this.scrollUpdate);
      }
    },
    processTaskLoaded() {
      if (this.src) {
        this.loading = true;
        this.numPages = 0;

        this.src.promise.then(pdf => {
          this.numPages = pdf.numPages;
    
          this.$nextTick(() => {
            this.initPages();
    
            this.loading = false;
          });
        }, err => {
          this.loading = false;
          this.logError(err);
        });
      } else {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.processTaskLoaded();
  }
}
</script>

<style>
/* viewer */
.pdf-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.pdf-viewer--content-wrapper {
  background: #fafafa;
  flex: 1;
  text-align: center;
  overflow: auto;
  position: relative;
}
.pdf-viewer--page-container {
  max-width: 960px;
  margin: 0 auto;
}
.pdf-viewer--page {
  margin: 20px 30px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
}

/* spin */
.pdf-viewer-spin {
  color: #b3b3b3;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
}
.pdf-viewer-spin--icon {
  display: block;
  animation: loadingCircle 1s infinite linear;
  font-size: 50px;
}
.pdf-viewer-spin--label {
  font-size: 13px;
  margin-top: 12px;
}
@keyframes loadingCircle {
  100% {
    transform:rotate(360deg);
  }
}

/* bar */
.pdf-viewer-bar {
  height: 35px;
  flex: 0;
  background: #f2f2f2;
  box-shadow: 0 -1px 0 0 #d3d3d3;
  box-sizing: border-box;
  border-top: 1px solid #e0e0e0;
  cursor: default;
  font-size: 13px;
}
.pdf-viewer-bar--group-left,
.pdf-viewer-bar--group-right {
  float: left;
  height: 100%;
  display: flex;
  align-items: center;
}
.pdf-viewer-bar--group-left {
  margin-left: 14px;
}
.pdf-viewer-bar--group-right {
  float: right;
  margin-right: 14px;
}
.pdf-viewer-bar--fullscreen {
  width: 25px;
  height: 25px;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-viewer-bar--fullscreen.is-disabled {
  cursor: not-allowed;
}
.pdf-viewer-bar--fullscreen:hover {
  background: #dbdbdb;
}
.pdf-viewer-bar--fullscreen-icon {
  width: 13px;
  height: 13px;
}
.pdf-viewer-bar--exit-fullscreen-icon {
  width: 13px;
  height: 13px;
  display: none;
  margin-right: 6px;
}

/* bar in fullscreen */
.is-fullscreen .pdf-viewer-bar--fullscreen {
  margin-right: 20px;
  width: 90px;
  height: 34px;
  background: #fff;
  border-radius: 3px;
  border: 1px solid #cecece;
  box-sizing: border-box;
}
.is-fullscreen .pdf-viewer-bar {
  height: 50px;
}
.is-fullscreen .pdf-viewer-bar--fullscreen-icon {
  display: none;
}
.is-fullscreen .pdf-viewer-bar--exit-fullscreen-icon {
  display: inline-block;
}
</style>
