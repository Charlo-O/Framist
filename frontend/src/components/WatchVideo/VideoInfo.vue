<!-- 视频信息组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NotesAPI } from '@/composables/NotesAPI'
import { ElMessage } from 'element-plus'

const router = useRouter()

const props = withDefaults(
  defineProps<{
    filename: string
    title: string
    description: string
    id: number
  }>(),
  {
    description: '',
  },
)

const fileInputRef = ref<HTMLInputElement>()
const isUploading = ref(false)

// Handle file upload
const handleFileUpload = () => {
  fileInputRef.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  isUploading.value = true
  try {
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file) {
             await NotesAPI.uploadAttachment(props.id, file)
        }
    }
    ElMessage.success('附件上传成功')
  } catch (error: any) {
    console.error('Upload failed:', error)
    ElMessage.error(error.message || '上传失败')
  } finally {
    isUploading.value = false
    target.value = '' // Reset input
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-ink/5 shadow-sm p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-display font-bold text-ink">视频操作</h2>
      <div class="flex space-x-3">
        <!-- AI笔记入口 -->
        <button
          @click="router.push(`/notes/${props.filename}`)"
          class="px-5 py-2.5 text-sm font-bold text-ink bg-mint hover:bg-opacity-90 rounded-xl transition-all duration-300 shadow-lg shadow-mint/20 flex items-center space-x-2 transform hover:scale-105"
        >
          <span>🤖</span>
          <span>AI笔记</span>
        </button>

        <!-- 上传附件按钮 -->
        <button
          @click="handleFileUpload"
          :disabled="isUploading"
          class="px-5 py-2.5 text-sm font-medium text-ink bg-white border border-ink/10 hover:bg-mint/20 rounded-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isUploading" class="animate-spin h-4 w-4 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <span>{{ isUploading ? '上传中...' : '上传附件' }}</span>
        </button>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      @change="onFileSelected"
      class="hidden"
    />
  </div>
</template>
