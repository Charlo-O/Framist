<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// i18n functionality
const { t } = useI18n()
import {
  LibraryBig,
  Search as LucideSearch,
  History,
  Home,
  Video,
  Settings,
  Plus,
  FolderOpen,
  RefreshCw,
  MoreHorizontal,
  User,
  UserPlus,
  LogOut,
  ChevronUp,
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus'
import type { Category } from '@/types/media'
import { getCSRFToken } from '@/composables/GetCSRFToken'
import UsersDialog from '@/components/dialogs/UsersDialog.vue'
/*
说明：Home.vue中的侧边栏页面 (Sidebar)
◇ 布局结构
- 1.上方实现MenuItem，点击时切换Main page的内容（向父组件Home.vue发送切换的信号）
- 2.中间实现Folder的CRUD命令（增删改查）
- 3.下方展示Logo，名称(VidGo)，版本号，以及右侧切换Sidebar展开/收起状态的Icon，以FlexBox形式排版。
- 4.当Sidebar收起时，只展示 展开Sidebar的Icon，Home Icon，搜索Icon
*/

/** 工具函数：统一 POST, 自动解析 / 提示，返回 data 或 null */
async function request_post<T>(
  url: string,
  payload: unknown,
  successMsg = '操作成功',
): Promise<T | null> {
  try {
    // Get CSRF token
    const csrfToken = await getCSRFToken()

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await resp.json()

    if (!resp.ok || data?.success === false) throw new Error(data?.error || resp.statusText)

    ElMessage.success(data?.message || t(successMsg) || successMsg)
    return data as T
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || t('networkError'))
    return null
  }
}

// 1.更新MenuItem
const menuList = [
  { key: 'home', icon: Home, action: () => emit('updateMenuIndex', 0) },
  { key: 'library', icon: Video, action: () => emit('updateMenuIndex', 1) },
  { key: 'history', icon: History, action: () => emit('updateMenuIndex', 2) },
  { key: 'settings', icon: Settings, action: openSettings },
  { key: 'search', icon: LucideSearch, action: openSearch, tooltip: 'Ctrl+K' },
]

const selectedCategoryId = ref(-1)

function openSearch() {
  emit('open-search')
}

function openSettings() {
  // Update menu index to show settings view
  emit('updateMenuIndex', 3)
}
import { BACKEND } from '@/composables/ConfigAPI'

/* 2.创建分类 */
async function createCategory() {
  const { value } = await ElMessageBox.prompt('请输入新建分类名称', '新建分类', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '文件夹名称不能为空',
  }).catch(() => ({ value: '' }) as any)

  if (!value) return

  const res = await request_post(
    `${BACKEND}/api/category/add/0`,
    { categoryName: value },
    '文件夹创建成功',
  )

  if (res) emit('refresh') // ✅ 通知父组件重新 fetch
}

// 3.创建合集
async function createCollection() {
  // First get the currently selected category
  const categoryId = selectedCategoryId.value === -1 ? 0 : selectedCategoryId.value

  const { value } = await ElMessageBox.prompt('请输入新建合集名称', '新建合集', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '合集名称不能为空',
  }).catch(() => ({ value: '' }) as any)

  if (!value) return

  const res = await request_post(
    `${BACKEND}/api/collection/create/0`,
    { name: value, category_id: categoryId },
    '合集创建成功',
  )

  if (res) emit('refresh') // ✅ 通知父组件重新 fetch
}

//选中分类
function selectCategory(id: number) {
  selectedCategoryId.value = id
  emit('select-category', id)
}

// 重命名分类
const editingCategoryId = ref<number | null>(null)
const originalName = ref('')
const draftName = ref('')
function startEdit(category: Category) {
  editingCategoryId.value = category.id
  originalName.value = category.name
  draftName.value = category.name
}

async function finishEdit(category: Category) {
  const name = draftName.value.trim()
  if (!name || name === category.name) {
    editingCategoryId.value = null
    return
  }

  const ok = await request_post(
    `${BACKEND}/api/category/rename/0`,
    { oldName: category.name, newName: name },
    '重命名成功',
  )

  editingCategoryId.value = null
  ok && emit('refresh')
}

// 删除文件夹
async function handleCategoryCommand(cmd: string, category: Category) {
  if (cmd === 'rename') return startEdit(category)
  /* delete */ else if (cmd === 'delete') {
    const ok = await ElMessageBox.confirm(
      `其中的视频将归入“无分类”，确定删除 "${category.name}" 吗？`,
      '警告',
    ).catch(() => false)
    if (!ok) return

    const res = await request_post(
      `${BACKEND}/api/category/delete/0`,
      { categoryName: category.name },
      '删除成功',
    )
    res && emit('refresh')
  }
  // 添加合集
  else if (cmd === 'create-collection') {
    // Set the selected category to this category before creating collection
    selectCategory(category.id)
    createCollection()
  }
}

// 折叠侧边栏
const collapsed = ref(false)
const toggleCollapse = () => (collapsed.value = !collapsed.value)

// User management
interface User {
  id: number
  username: string
  email: string
  is_root: boolean
  premium_authority: boolean
  is_active: boolean
}

const currentUser = ref<User | null>(null)
const showUserDropdown = ref(false)
const showUsersDialog = ref(false)

// Check if user is logged in on mount
const checkUserStatus = async () => {
  try {
    const response = await fetch(`${BACKEND}/api/auth/profile/`, {
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        console.log('User data received:', data.user) // Debug log
        currentUser.value = data.user
      }
    }
  } catch (error) {
    console.error('Error checking user status:', error)
  }
}

// Logout function
const handleLogout = async () => {
  try {
    const response = await fetch(`${BACKEND}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      currentUser.value = null
      showUserDropdown.value = false
      ElMessage.success('已退出登录')
    }
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('退出登录失败')
  }
}

// Handle user area click
const handleUserAreaClick = async () => {
  if (currentUser.value) {
    showUserDropdown.value = !showUserDropdown.value
  } else {
    // Emit event to parent (Home.vue) to handle login dialog
    emit('show-login')
  }
}

// Handle user management click
const handleUserManagementClick = () => {
  showUsersDialog.value = true
  showUserDropdown.value = false
}

// Initialize user status check
onMounted(() => {
  checkUserStatus()
})

// Watch for authentication changes and emit refresh
watch(currentUser, (newUser, oldUser) => {
  // If user logs in (from null to user), emit refresh
  if (!oldUser && newUser) {
    emit('refresh')
  }
  // If user logs out (from user to null), emit refresh
  else if (oldUser && !newUser) {
    emit('refresh')
  }
})

// 从上级继承属性
const props = defineProps<{
  currentMenuIdx: number
  categories: Category[]
  isAuthenticated: boolean
}>()

// 向上级发送信号
const emit = defineEmits<{
  (e: 'update-menuIndex', idx: number): void
  (e: 'updateMenuIndex', idx: number): void
  (e: 'open-search'): void
  (e: 'open-settings'): void
  (e: 'select-category', id: number): void
  (e: 'refresh'): void
  (e: 'show-login'): void
}>()
</script>

<template>
  <div
    class="sidebar sidebar-framist flex flex-col h-full transition-all duration-300"
    :class="[
      collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
    ]"
  >
    <!--缩起版 侧边栏-->
    <div v-if="collapsed" class="flex flex-col items-center py-6 space-y-6 flex-none px-2">
      <el-tooltip :content="t('displaySidebar')" placement="right">
        <button
          @click="toggleCollapse"
          class="text-mist hover:text-ink p-2 rounded-xl hover:bg-white transition-all duration-200"
        >
          <LibraryBig :size="20" />
        </button>
      </el-tooltip>
      <el-tooltip :content="t('home')" placement="right">
        <button
          @click="emit('updateMenuIndex', 0)"
          class="text-mist hover:text-ink p-2 rounded-xl hover:bg-white transition-all duration-200"
        >
          <Home :size="20" />
        </button>
      </el-tooltip>
      <el-tooltip content="Search (Ctrl+K)" placement="right">
        <button
          @click="openSearch"
          class="text-mist hover:text-ink p-2 rounded-xl hover:bg-white transition-all duration-200"
        >
          <LucideSearch :size="20" />
        </button>
      </el-tooltip>
    </div>

    <!-- 展开版 侧边栏 -->
    <template v-if="!collapsed">
      <!-- 加个空行美化排版 -->
      <div class="py-6 flex items-center justify-center">
         <!-- Brand Logo Top -->
         <div class="flex items-center space-x-3">
            <div class="relative w-8 h-8 flex items-center justify-center border-2 border-ink rounded-lg">
               <!-- Viewfinder Gap Top Right -->
               <div class="absolute -top-1 -right-1 w-2 h-2 bg-paper z-10"></div>
               <span class="font-display font-bold text-xl text-ink">F</span>
            </div>
            <span class="font-display font-bold text-xl tracking-wider text-ink">FRAMIST</span>
         </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 scrollbar-premium space-y-6">
        <!-- Menu items -->
        <div class="space-y-1">
          <div
            v-for="(item, i) in menuList"
            :key="i"
            class="nav-item cursor-pointer"
            :class="props.currentMenuIdx === i ? 'active' : ''"
            @click="item.action()"
          >
            <!-- Render Icon/Text based on tooltip -->
            <component :is="item.icon" :size="20" :class="props.currentMenuIdx === i ? 'text-mint' : 'text-ink opacity-70'" />
            <span class="ml-3 font-medium">{{ t(item.key) }}</span>
          </div>
        </div>

        <div class="border-t border-ink border-opacity-10 my-4"></div>

        <!-- 分类 - 只在用户登录时显示 -->
        <template v-if="currentUser">
          <h6
            class="mb-3 flex items-center justify-between text-xs font-bold text-mist tracking-widest uppercase pl-2"
          >
            <div>{{ t('categories') }}</div>
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button @click="emit('refresh')" class="hover:text-ink"><RefreshCw :size="12" /></button>
               <button @click="createCategory" class="hover:text-ink"><Plus :size="12" /></button>
            </div>
          </h6>
          
          <div class="space-y-1">
            <div
              v-for="category in props.categories"
              :key="category.id"
              class="group px-3 py-2 rounded-lg flex items-center cursor-pointer transition-all duration-200"
              :class="
                category.id === selectedCategoryId
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink hover:bg-white hover:pl-4'
              "
              @click="selectCategory(category.id)"
            >
              <div class="w-full flex items-center justify-between">
                <div class="flex items-center flex-1 overflow-hidden">
                  <FolderOpen :size="16" class="mr-3 flex-shrink-0" :class="category.id === selectedCategoryId ? 'text-mint' : 'text-mist'" />
                  
                  <template v-if="editingCategoryId !== category.id">
                    <span class="font-medium truncate text-sm">{{ category.name }}</span>
                  </template>
                  <template v-else>
                    <input
                      v-model="draftName"
                      @keyup.enter="finishEdit(category)"
                      @blur="editingCategoryId = null"
                      @click.stop
                      class="ml-1 w-full px-1 py-0 bg-transparent border-b border-white text-white focus:outline-none"
                      autoFocus
                    />
                  </template>
                </div>

                <!-- More icon -->
                <el-dropdown
                  v-if="editingCategoryId !== category.id"
                  trigger="hover"
                  @command="(cmd: string) => handleCategoryCommand(cmd, category)"
                  @click.stop
                  class="more-dropdown opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button class="p-1 hover:text-mint transition-colors">
                    <MoreHorizontal :size="14" />
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="rename">{{ t('rename') }}</el-dropdown-item>
                      <el-dropdown-item command="create-collection">{{ t('addCollection') }}</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>{{ t('delete') }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </template>

        <!-- 未登录状态提示 -->
        <template v-else>
          <div class="flex-1 flex items-center justify-center py-10">
            <div class="text-center text-mist">
              <p class="text-sm font-medium">{{ t('loginToViewCategories') }}</p>
            </div>
          </div>
        </template>
      </nav>

      <!-- User Status Area -->
      <div class="p-4 border-t border-ink border-opacity-5 bg-white bg-opacity-40">
        <div
          @click="handleUserAreaClick"
          class="flex items-center cursor-pointer group"
        >
          <div
            class="w-10 h-10 rounded-full bg-paper border border-ink border-opacity-10 flex items-center justify-center text-ink group-hover:scale-105 transition-transform"
          >
            <User :size="18" />
          </div>
          <div class="ml-3 flex-1 overflow-hidden">
            <div v-if="currentUser" class="text-sm font-bold text-ink truncate">
              {{ currentUser.username }}
            </div>
            <div v-else class="text-sm font-bold text-ink">{{ t('notLoggedIn') }}</div>
            <div class="text-xs text-mist flex items-center">
              <div class="w-1.5 h-1.5 rounded-full mr-1.5" :class="currentUser ? 'bg-mint' : 'bg-mist'"></div>
              {{ currentUser ? 'Online' : 'Guest' }}
            </div>
          </div>
          <ChevronUp
             v-if="currentUser"
             :size="16"
             class="text-mist transition-transform duration-200"
             :class="{ 'rotate-180': showUserDropdown }"
           />
        </div>

        <!-- User Dropdown -->
        <div
          v-if="currentUser && showUserDropdown"
          class="mt-3 bg-white rounded-xl border border-ink border-opacity-10 shadow-float overflow-hidden"
        >
          <div
            v-if="currentUser.is_root"
            @click="handleUserManagementClick"
            class="flex items-center px-4 py-3 hover:bg-paper cursor-pointer transition-colors"
          >
            <UserPlus :size="14" class="text-ink mr-3" />
            <span class="text-sm text-ink font-medium">{{ t('userManagement') }}</span>
          </div>
          <div
            @click="handleLogout"
            class="flex items-center px-4 py-3 hover:bg-coral hover:bg-opacity-10 hover:text-coral cursor-pointer transition-colors border-t border-ink border-opacity-5"
          >
            <LogOut :size="14" class="mr-3" />
            <span class="text-sm font-medium">{{ t('logout') }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Toggle -->
      <div class="px-4 py-3 flex justify-center">
        <el-tooltip :content="t('hideSidebar')" placement="top">
          <button
            @click="toggleCollapse"
            class="text-mist hover:text-ink transition-colors"
          >
            <div class="w-8 h-1 bg-ink rounded-full opacity-10 hover:opacity-30"></div>
          </button>
        </el-tooltip>
      </div>

    </template>
  </div>

  <!-- Users Dialog Placeholder -->
  <UsersDialog
    v-if="showUsersDialog"
    v-model:visible="showUsersDialog"
    @users-updated="checkUserStatus"
  />
</template>

<style lang="postcss" scoped>
@reference "../../assets/tailwind.css";
@tailwind utilities;

.sidebar nav {
  scrollbar-width: thin;
  scrollbar-color: #E0E0E0 transparent; 
}
.sidebar nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar nav::-webkit-scrollbar-thumb {
  background-color: #E0E0E0; 
  border-radius: 4px;
}
.sidebar nav::-webkit-scrollbar-track {
  background: transparent;
}

/* Responsive sidebar width */
.sidebar-expanded {
  width: 260px; /* Fixed width for better precision */
}
.sidebar-collapsed {
  width: 80px;
}

@media (min-width: 1440px) {
  .sidebar-expanded {
    width: 280px;
  }
}
</style>
