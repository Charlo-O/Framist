<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useHiddenCategories } from '@/composables/useHiddenCategories'

import { BACKEND } from '@/composables/ConfigAPI'

const props = defineProps<{
  modelValue: boolean
  selectedIds: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'moved'): void // 通知父组件刷新
}>()

// 定义合集类型
interface Collection {
  id: number
  name: string
  category_id: number
  category_name: string
  thumbnail_url: string
  created_time: string
  last_modified: string
  video_count: number
}

const collections = ref<Collection[]>([])
const targetId = ref<number | null>(null)
const showCreateInput = ref(false)
const newCollectionName = ref('')
const creating = ref(false)

// 获取所有合集
async function fetchCollections() {
  try {
    // 获取隐藏的分类ID列表
    const { hiddenCategoryIds } = useHiddenCategories()
    const hiddenCategoriesParam =
      hiddenCategoryIds.value.length > 0
        ? `?hidden_categories=${hiddenCategoryIds.value.join(',')}`
        : ''
    console.log('Fetching collections with hidden categories:', hiddenCategoriesParam)
    const response = await axios.get(`${BACKEND}/api/collection/list${hiddenCategoriesParam}`)
    collections.value = response.data.collections
    console.log(collections.value)
  } catch (e: any) {
    console.error('获取合集列表失败:', e)
    ElMessage.error('获取合集列表失败')
  }
}

// 创建新合集
async function createCollection() {
  const name = newCollectionName.value.trim()
  if (!name) {
    ElMessage.warning('请输入合集名称')
    return
  }

  creating.value = true
  try {
    const response = await axios.post(
      `${BACKEND}/api/collection/create/0`,
      { name, category_id: 0 },
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (response.data.success) {
      ElMessage.success(`合集 "${name}" 创建成功`)
      // 刷新列表并选中新创建的合集
      await fetchCollections()
      targetId.value = response.data.collection.id
      newCollectionName.value = ''
      showCreateInput.value = false
    } else {
      ElMessage.error(response.data.message || '创建失败')
    }
  } catch (e: any) {
    console.error('创建合集失败:', e)
    ElMessage.error(e.response?.data?.message || '创建合集失败')
  } finally {
    creating.value = false
  }
}

// 当对话框打开时刷新合集列表
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchCollections()
    targetId.value = null
    showCreateInput.value = false
    newCollectionName.value = ''
  }
})

onMounted(() => {
  fetchCollections()
})

async function confirm() {
  if (targetId.value === null) {
    ElMessage.warning('请选择目标合集')
    return
  }

  try {
    // 使用批量操作API
    const response = await axios.post(
      `${BACKEND}/api/videos/batch_action`,
      {
        action: 'move_to_collection',
        videoIds: props.selectedIds,
        collectionId: targetId.value,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    )

    if (response.data.success) {
      ElMessage.success(response.data.message || `已移动 ${props.selectedIds.length} 个视频`)
      emit('moved')
      emit('update:modelValue', false)
    } else {
      ElMessage.error(response.data.error || '批量移动失败')
    }
  } catch (e: any) {
    console.error('批量移动失败:', e)
    ElMessage.error(e.response?.data?.error || '批量移动失败')
  }
}
</script>

<template>
  <el-dialog
    title="批量移动到合集"
    width="380px"
    :model-value="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- 合集选择 -->
      <el-select v-model="targetId" placeholder="请选择目标合集" class="w-full">
        <el-option
          v-for="collection in collections"
          :key="collection.id"
          :label="collection.name"
          :value="collection.id"
        />
      </el-select>

      <!-- 新建合集区域 -->
      <div v-if="!showCreateInput" class="text-center">
        <button
          @click="showCreateInput = true"
          class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
        >
          + 新建合集
        </button>
      </div>

      <div v-else class="flex items-center space-x-2">
        <el-input
          v-model="newCollectionName"
          placeholder="输入新合集名称"
          size="default"
          @keyup.enter="createCollection"
        />
        <el-button
          type="primary"
          size="default"
          :loading="creating"
          @click="createCollection"
        >
          创建
        </el-button>
        <el-button
          size="default"
          @click="showCreateInput = false; newCollectionName = ''"
        >
          取消
        </el-button>
      </div>

      <!-- 空状态提示 -->
      <div v-if="collections.length === 0 && !showCreateInput" class="text-center text-gray-400 text-sm py-4">
        暂无合集，请先创建一个合集
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="confirm" :disabled="targetId === null">确定</el-button>
    </template>
  </el-dialog>
</template>
