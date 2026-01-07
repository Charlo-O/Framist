<script setup lang="ts">
import type { Collection } from '@/types/media'
import { More, EditPen, Folder, Delete } from '@element-plus/icons-vue'
import { SquarePen, FolderOpen } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import CollectionMoveDialog from '@/components/dialogs/CollectionMoveDialog.vue'
import { ref, nextTick, computed } from 'vue'
import { getCSRFToken } from '@/composables/GetCSRFToken'

const props = defineProps<{ col: Collection; view: 'grid' | 'list' }>()
const videoCount = props.col.videos.length
import { BACKEND } from '@/composables/ConfigAPI'

const FALLBACK_IMG =
  'https://pic.chaopx.com/chao_water_pic/23/03/03/e78a5cf45f9ebc92411a8f9531975dec.jpg'

// Get up to 4 video thumbnails for grid display
const thumbnailGrid = computed(() => {
  const videos = props.col.videos || []
  return videos.slice(0, 4).map(v => {
    if (v.thumbnail) {
      return `${BACKEND}/media/${encodeURIComponent(v.thumbnail)}`
    }
    return FALLBACK_IMG
  })
})

// Inline editing state
const isEditing = ref(false)
const editingName = ref('')
const inputRef = ref<HTMLInputElement>()

// Collection move dialog state
const showCollectionMoveDialog = ref(false)
const categories = ref<{ id: number; name: string }[]>([])
const isLoadingCategories = ref(false)

const emit = defineEmits<{
  (e: 'edit-thumbnail', collection: Collection): void
  (e: 'open-collection', id: number): void
  (e: 'delete-collection', collection: Collection): void
  (e: 'rename-collection', collection: Collection, newName: string): void
  (e: 'collection-moved', collection: Collection): void
}>()

const handleDelete = () => {
  if (props.col.videos.length > 0) {
    ElMessage.warning('请先移动视频到其他合集')
    return
  }
  ElMessageBox.confirm(`确定要删除合集 "${props.col.name}" 吗？`, '删除合集', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const csrf = await getCSRFToken()
        const response = await fetch(`${BACKEND}/api/collection/delete/${props.col.id}`, {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': csrf,
          },
          credentials: 'include',
        })

        const result = await response.json()
        if (result.success) {
          ElMessage.success('合集删除成功')
          emit('delete-collection', props.col)
        } else {
          ElMessage.error(result.message || '删除失败')
        }
      } catch (error) {
        ElMessage.error('网络错误，请重试')
        console.error('Delete error:', error)
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

const startEditing = async () => {
  isEditing.value = true
  editingName.value = props.col.name
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const saveEdit = async () => {
  const newName = editingName.value.trim()
  if (!newName) {
    ElMessage.warning('名称不能为空')
    return
  }
  if (newName === props.col.name) {
    isEditing.value = false
    return
  }

  try {
    const csrf = await getCSRFToken()
    const response = await fetch(`${BACKEND}/api/collection/rename/${props.col.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf,
      },
      credentials: 'include',
      body: JSON.stringify({ newName }),
    })

    const result = await response.json()
    if (result.success) {
      emit('rename-collection', props.col, newName)
      isEditing.value = false
      ElMessage.success('重命名成功')
    } else {
      ElMessage.error(result.message || '重命名失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
    console.error('Rename error:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingName.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

const openCollectionMoveDialog = async () => {
  if (isLoadingCategories.value) return

  isLoadingCategories.value = true
  try {
    const response = await fetch(`${BACKEND}/api/category/query/0`)
    const result = await response.json()

    if (result.success) {
      categories.value = [
        { id: 0, name: '未分类' },
        ...result.categories.map((cat: any) => ({
          id: cat.id || 0,
          name: cat.name,
        })),
      ]
      showCollectionMoveDialog.value = true
    } else {
      ElMessage.error('获取分类列表失败')
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    isLoadingCategories.value = false
  }
}

const onCollectionMoved = () => {
  showCollectionMoveDialog.value = false
  emit('collection-moved', props.col)
}
</script>

<template>
  <div
    class="collection-card relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group cursor-pointer"
    @click="emit('open-collection', col.id)"
  >
    <!-- Thumbnail Grid (2x2) -->
    <div class="h-48 bg-gray-200">
      <div v-if="thumbnailGrid.length >= 4" class="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
        <img v-for="(thumb, idx) in thumbnailGrid" :key="idx" :src="thumb" class="w-full h-full object-cover" />
      </div>
      <div v-else-if="thumbnailGrid.length > 0" class="h-full">
        <img :src="thumbnailGrid[0]" class="w-full h-full object-cover" />
      </div>
      <div v-else class="h-full flex items-center justify-center bg-gray-300">
        <FolderOpen :size="48" class="text-gray-400" />
      </div>
    </div>
    
    <!-- Collection Badge (top left) -->
    <div
      class="absolute top-2 left-2 flex items-center space-x-1 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded z-20"
    >
      <el-icon class="w-3 h-3"><Folder /></el-icon>
      <span>合集</span>
    </div>
    
    <!-- Video Count Badge (top right) -->
    <div
      class="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded z-20"
    >
      {{ videoCount }}个视频
    </div>
    
    <!-- Hover Overlay with Open Icon -->
    <div
      class="absolute left-0 right-0 top-0 h-48 bg-black/30 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
    >
      <div class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
        <FolderOpen :size="28" class="text-gray-800" />
      </div>
    </div>
    
    <!-- Bottom Gradient Overlay with Title -->
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
      <div v-if="!isEditing" class="flex items-center gap-2">
        <h3 class="font-semibold text-white truncate flex-1 text-base drop-shadow-lg">
          {{ col.name }}
        </h3>
        
        <!-- Buttons (stop propagation to prevent opening collection) -->
        <div class="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1" @click.stop>
          <button class="text-white hover:text-blue-200 transition-colors p-1" @click.stop="startEditing">
            <SquarePen :size="16" class="drop-shadow" />
          </button>
          <el-dropdown trigger="click">
            <button class="text-white hover:text-blue-200 transition-colors p-1">
              <el-icon class="text-lg"><More /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openCollectionMoveDialog">
                  <el-icon class="mr-2"><EditPen /></el-icon> 移动至分类
                </el-dropdown-item>
                <el-dropdown-item @click="emit('edit-thumbnail', col)">
                  <el-icon class="mr-2"><EditPen /></el-icon> 更换预览图
                </el-dropdown-item>
                <el-dropdown-item @click="handleDelete" divided class="text-red-500">
                  <el-icon class="mr-2"><Delete /></el-icon> 删除合集
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- Editing Mode -->
      <div v-else class="flex items-center gap-2" @click.stop>
        <input
          ref="inputRef"
          v-model="editingName"
          class="flex-1 font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-white/50 text-sm"
          @keydown="handleKeydown"
          @blur="saveEdit"
        />
      </div>
      
      <!-- Last Modified -->
      <div class="text-xs text-white/70 mt-1">{{ col.last_modified }}</div>
    </div>

    <!-- Collection Move Dialog -->
    <CollectionMoveDialog
      v-model="showCollectionMoveDialog"
      :collection="col"
      :categories="categories"
      @moved="onCollectionMoved"
    />
  </div>
</template>

