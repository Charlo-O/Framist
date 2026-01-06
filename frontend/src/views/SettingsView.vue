<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-slate-800">⚙️ 系统设置</h1>
            <p class="text-sm text-slate-500">配置应用的各项功能参数</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button
            @click="resetSettings"
            :disabled="loading || saving"
            class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 重置默认
          </button>
          <button
            @click="saveSettings"
            :disabled="loading || saving"
            class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <span
              v-if="saving"
              class="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            {{ saving ? '保存中...' : '💾 保存设置' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-600 text-lg">加载设置中...</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <!-- LLM设置 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mr-3 text-lg">🤖</span>
          LLM设置
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div class="flex items-center space-x-2">
              <el-input
                v-model="currentApiKey"
                type="password"
                show-password
                placeholder="输入API密钥"
                class="flex-1"
              />
              <button
                @click="copyToClipboard(currentApiKey)"
                class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 whitespace-nowrap"
              >
                复制
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
            <input
              v-model="currentBaseUrl"
              type="url"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入API基础URL"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">模型提供商选择</label>
            <select
              v-model="settings.selectedModelProvider"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="provider in providerOptions" :key="provider.value" :value="provider.value">
                {{ provider.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">模型名称</label>
            <input
              v-model="currentModelName"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="getDefaultModelName()"
            />
            <p class="mt-1 text-xs text-gray-500">
              留空使用默认模型（{{ getDefaultModelName() }}）
            </p>
          </div>

          <div class="flex items-center justify-between">
            <el-switch
              v-model="settings.useProxy"
              active-text="使用代理"
              inactive-text="不使用代理"
            />
            <el-switch
              v-model="settings.enableThinking"
              active-text="启用思考"
              inactive-text="普通模型"
            />
          </div>

          <div class="flex justify-end">
            <button
              @click="testLLMConnection"
              :disabled="connectionTesting"
              class="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ connectionTesting ? '测试中...' : '测试连接' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 界面设置 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-lg">🎨</span>
          界面设置
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">原始语言</label>
            <select
              v-model="settings.rawLanguage"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 字幕设置 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-lg">📝</span>
          字幕设置
        </h2>

        <!-- 字幕类型切换 -->
        <div class="mb-6">
          <div class="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
              @click="subtitleType = 'raw'"
              :class="[
                'py-2 px-6 text-sm font-medium rounded-md transition-colors',
                subtitleType === 'raw'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              原文字幕
            </button>
            <button
              @click="subtitleType = 'foreign'"
              :class="[
                'py-2 px-6 text-sm font-medium rounded-md transition-colors',
                subtitleType === 'foreign'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              译文字幕
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            当前编辑：{{ subtitleType === 'raw' ? '原文' : '外文' }}字幕样式
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 字体设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">字体系列</label>
            <select
              :value="currentSubtitleSettings.fontFamily"
              @input="updateCurrentSubtitleSettings('fontFamily', ($event.target as HTMLSelectElement).value)"
              class="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="宋体">宋体</option>
              <option value="微软雅黑">微软雅黑</option>
              <option value="Arial">Arial</option>
            </select>
          </div>

          <!-- 字体颜色 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">字体颜色</label>
            <input
              type="color"
              :value="currentSubtitleSettings.fontColor"
              @input="updateCurrentSubtitleSettings('fontColor', ($event.target as HTMLInputElement).value)"
              class="w-full h-10 rounded border cursor-pointer"
            />
          </div>

          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              字体大小: {{ currentSubtitleSettings.fontSize }}px
            </label>
            <input
              type="range"
              :value="currentSubtitleSettings.fontSize"
              @input="updateCurrentSubtitleSettings('fontSize', parseInt(($event.target as HTMLInputElement).value))"
              min="12"
              max="48"
              class="w-full"
            />
          </div>

          <!-- 距底边距离 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              距底边距离: {{ bottomDistanceProxy }}px
            </label>
            <input
              type="range"
              v-model="bottomDistanceProxy"
              min="20"
              max="200"
              step="10"
              class="w-full"
            />
          </div>
        </div>

        <!-- 预览 -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">实时预览</label>
          <div
            class="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-800 text-center"
            :style="{
              fontFamily: currentSubtitleSettings.fontFamily,
              fontSize: currentSubtitleSettings.fontSize + 'px',
              color: currentSubtitleSettings.fontColor,
              fontWeight: currentSubtitleSettings.fontWeight,
            }"
          >
            {{ currentSubtitleSettings.previewText }}
          </div>
        </div>
      </section>

      <!-- 转录引擎设置 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-lg">🎤</span>
          转录引擎设置
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">转录引擎</label>
            <select
              v-model="settings.transcriptionPrimaryEngine"
              class="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="whisper_cpp">Whisper.cpp (本地C++实现, CPU/GPU)</option>
              <option value="elevenlabs">ElevenLabs Speech-to-Text</option>
              <option value="alibaba">阿里巴巴 DashScope</option>
              <option value="openai_whisper">OpenAI Whisper API</option>
            </select>
          </div>

          <!-- Whisper.cpp 特定设置 -->
          <div v-if="settings.transcriptionPrimaryEngine === 'whisper_cpp'" class="space-y-4 border-t pt-4 mt-4">
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p class="text-sm text-blue-700">
                ✅ Whisper.cpp: 官方C++实现，Docker镜像小(~500MB)，支持CPU-only和GPU加速
              </p>
            </div>

            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
              <div>
                <span class="text-sm font-medium text-gray-700">🚀 启用GPU加速</span>
                <p class="text-xs text-gray-500 mt-1">
                  {{ settings.useGpu ? 'CUDA GPU加速 (需要NVIDIA GPU)' : 'CPU-only模式 (无需GPU)' }}
                </p>
              </div>
              <el-switch v-model="settings.useGpu" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">GGML模型</label>
              <select
                v-model="settings.fwsrModel"
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="tiny">tiny (~75 MB)</option>
                <option value="base">base (~142 MB)</option>
                <option value="small">small (~466 MB)</option>
                <option value="medium">medium (~1.5 GB)</option>
                <option value="large-v3">large-v3 (~3.1 GB) ✅</option>
              </select>
            </div>
          </div>

          <!-- 阿里巴巴 DashScope 设置 -->
          <div v-if="settings.transcriptionPrimaryEngine === 'alibaba'" class="space-y-4 border-t pt-4 mt-4">
            <div class="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p class="text-sm text-purple-700">
                ✅ 阿里巴巴 DashScope: 实时语音识别，支持多种语言和方言
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <el-input
                v-model="settings.transcriptionAlibabaApiKey"
                type="password"
                show-password
                placeholder="输入 DashScope API Key"
              />
              <p class="mt-1 text-xs text-gray-500">
                可在 <a href="https://dashscope.console.aliyun.com/" target="_blank" class="text-blue-600 hover:underline">DashScope 控制台</a> 获取
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
              <select
                v-model="settings.transcriptionAlibabaModel"
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="paraformer-realtime-v2">Paraformer 实时 v2 (推荐)</option>
                <option value="paraformer-v2">Paraformer v2</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">自定义模型名称（可选）</label>
              <input
                v-model="settings.transcriptionAlibabaCustomModel"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                :placeholder="settings.transcriptionAlibabaModel || 'paraformer-realtime-v2'"
              />
              <p class="mt-1 text-xs text-gray-500">
                留空使用上方选择的模型，填写则使用自定义模型名称
              </p>
            </div>
          </div>

          <!-- OpenAI Whisper API 设置 -->
          <div v-if="settings.transcriptionPrimaryEngine === 'openai_whisper'" class="space-y-4 border-t pt-4 mt-4">
            <div class="p-3 bg-green-50 border border-green-200 rounded-md">
              <p class="text-sm text-green-700">
                ✅ OpenAI Whisper API: 云端高精度转录服务
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <el-input
                v-model="settings.transcriptionOpenaiApiKey"
                type="password"
                show-password
                placeholder="输入 OpenAI API Key"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
              <input
                v-model="settings.transcriptionOpenaiBaseUrl"
                type="url"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://api.openai.com/v1"
              />
              <p class="mt-1 text-xs text-gray-500">
                使用官方API或兼容的第三方服务地址
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">模型名称（可选）</label>
              <input
                v-model="settings.transcriptionOpenaiModel"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="whisper-1"
              />
              <p class="mt-1 text-xs text-gray-500">
                留空使用默认模型 whisper-1
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 媒体凭证 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3 text-lg">🔑</span>
          媒体凭证
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">B站登录SessData</label>
            <el-input
              v-model="settings.bilibiliSessData"
              type="password"
              show-password
              placeholder="输入B站登录SessData"
            />
            <p class="mt-2 text-sm text-gray-500">
              用于登录B站获取高清视频和字幕
            </p>
          </div>
        </div>
      </section>

      <!-- TTS配音设置 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mr-3 text-lg">🔊</span>
          TTS 配音设置
        </h2>
        
        <div class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800 mb-2">TTS 配音设置</h4>
            <p class="text-sm text-blue-700">
              配置 Alibaba Cloud DashScope 凭证以启用 TTS 配音生成功能。
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">DashScope API Key</label>
            <input
              v-model="settings.dashscopeApiKey"
              type="password"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="输入您的 DashScope API Key"
            />
          </div>
        </div>
      </section>

      <!-- OSS Service -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mr-3 text-lg">☁️</span>
          OSS Service
        </h2>
        
        <div class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Aliyun OSS 配置说明</h4>
            <p class="text-sm text-blue-700">
              配置 Aliyun OSS 凭证以启用音频克隆功能。上传的参考音频将存储在您的 OSS Bucket 中。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Access Key ID</label>
              <input
                v-model="settings.ossAccessKeyId"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="输入您的 Aliyun Access Key ID"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Access Key Secret</label>
              <input
                v-model="settings.ossAccessKeySecret"
                type="password"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="输入您的 Aliyun Access Key Secret"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
              <input
                v-model="settings.ossEndpoint"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="oss-cn-beijing.aliyuncs.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bucket 名称</label>
              <input
                v-model="settings.ossBucket"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="vidgo-test"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  loadConfig,
  saveConfig,
  type FrontendSettings,
  BACKEND,
} from '@/composables/ConfigAPI'
import { ElMessage } from 'element-plus'
import { useSubtitleStyle } from '@/composables/SubtitleStyle'

const router = useRouter()
const { updateSubtitleSettings, updateForeignSubtitleSettings } = useSubtitleStyle()

// 字幕类型选择
const subtitleType = ref<'raw' | 'foreign'>('raw')

// 距底边距离代理属性
const bottomDistanceProxy = computed({
  get() {
    return subtitleType.value === 'raw' ? settings.bottomDistance : settings.foreignBottomDistance
  },
  set(value: number) {
    if (subtitleType.value === 'raw') {
      settings.bottomDistance = value
    } else {
      settings.foreignBottomDistance = value
    }
  },
})

// 当前模型提供商的API密钥和基础URL
const currentApiKey = computed({
  get() {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        return settings.deepseekApiKey
      case 'openai':
        return settings.openaiApiKey
      case 'glm':
        return settings.glmApiKey
      case 'qwen':
        return settings.qwenApiKey
      default:
        return settings.deepseekApiKey
    }
  },
  set(value: string) {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        settings.deepseekApiKey = value
        break
      case 'openai':
        settings.openaiApiKey = value
        break
      case 'glm':
        settings.glmApiKey = value
        break
      case 'qwen':
        settings.qwenApiKey = value
        break
    }
  },
})

const currentBaseUrl = computed({
  get() {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        return settings.deepseekBaseUrl
      case 'openai':
        return settings.openaiBaseUrl
      case 'glm':
        return settings.glmBaseUrl
      case 'qwen':
        return settings.qwenBaseUrl
      default:
        return settings.deepseekBaseUrl
    }
  },
  set(value: string) {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        settings.deepseekBaseUrl = value
        break
      case 'openai':
        settings.openaiBaseUrl = value
        break
      case 'glm':
        settings.glmBaseUrl = value
        break
      case 'qwen':
        settings.qwenBaseUrl = value
        break
    }
  },
})

// 模型名称计算属性
const currentModelName = computed({
  get() {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        return settings.deepseekModelName || ''
      case 'openai':
        return settings.openaiModelName || ''
      case 'glm':
        return settings.glmModelName || ''
      case 'qwen':
        return settings.qwenModelName || ''
      default:
        return settings.deepseekModelName || ''
    }
  },
  set(value: string) {
    switch (settings.selectedModelProvider) {
      case 'deepseek':
        settings.deepseekModelName = value
        break
      case 'openai':
        settings.openaiModelName = value
        break
      case 'glm':
        settings.glmModelName = value
        break
      case 'qwen':
        settings.qwenModelName = value
        break
    }
  },
})

// 获取默认模型名称
function getDefaultModelName(): string {
  switch (settings.selectedModelProvider) {
    case 'deepseek':
      return 'deepseek-chat'
    case 'openai':
      return 'gpt-4o-mini'
    case 'glm':
      return 'glm-4-flash'
    case 'qwen':
      return 'qwen-max'
    default:
      return 'deepseek-chat'
  }
}

// 当前字幕设置
const currentSubtitleSettings = computed(() => {
  if (subtitleType.value === 'raw') {
    return {
      fontFamily: settings.fontFamily,
      previewText: settings.previewText,
      fontColor: settings.fontColor,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      backgroundColor: settings.backgroundColor,
      borderRadius: settings.borderRadius,
      textShadow: settings.textShadow,
      backgroundStyle: settings.backgroundStyle,
      bottomDistance: settings.bottomDistance,
    }
  } else {
    return {
      fontFamily: settings.foreignFontFamily,
      previewText: settings.foreignPreviewText,
      fontColor: settings.foreignFontColor,
      fontSize: settings.foreignFontSize,
      fontWeight: settings.foreignFontWeight,
      backgroundColor: settings.foreignBackgroundColor,
      borderRadius: settings.foreignBorderRadius,
      textShadow: settings.foreignTextShadow,
      backgroundStyle: settings.foreignBackgroundStyle,
      bottomDistance: settings.foreignBottomDistance,
    }
  }
})

// 更新当前字幕设置
const updateCurrentSubtitleSettings = (key: string, value: any) => {
  if (subtitleType.value === 'raw') {
    ;(settings as any)[key] = value
  } else {
    ;(settings as any)[`foreign${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value
  }
}

const providerOptions = [
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'GLM', value: 'glm' },
  { label: 'Qwen', value: 'qwen' },
]

const settings = reactive<FrontendSettings>({
  selectedModelProvider: 'deepseek',
  enableThinking: true,
  useProxy: false,
  deepseekApiKey: '',
  deepseekBaseUrl: 'https://api.deepseek.com',
  deepseekModelName: '',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModelName: '',
  glmApiKey: '',
  glmBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  glmModelName: '',
  qwenApiKey: '',
  qwenBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  qwenModelName: '',
  rawLanguage: 'zh',
  hiddenCategories: [],
  fontFamily: '宋体',
  previewText: '这是字幕预设文本',
  fontColor: '#ea9749',
  fontSize: 18,
  fontWeight: '400',
  backgroundColor: '#000000',
  borderRadius: 4,
  textShadow: false,
  textStroke: false,
  textStrokeColor: '#000000',
  textStrokeWidth: 2,
  backgroundStyle: 'semi-transparent',
  bottomDistance: 80,
  foreignFontFamily: 'Arial',
  foreignPreviewText: 'This is translated subtitle',
  foreignFontColor: '#ffffff',
  foreignFontSize: 16,
  foreignFontWeight: '400',
  foreignBackgroundColor: '#000000',
  foreignBorderRadius: 4,
  foreignTextShadow: false,
  foreignTextStroke: false,
  foreignTextStrokeColor: '#000000',
  foreignTextStrokeWidth: 2,
  foreignBackgroundStyle: 'semi-transparent',
  foreignBottomDistance: 120,
  bilibiliSessData: '',
  transcriptionPrimaryEngine: 'whisper_cpp',
  fwsrModel: 'large-v3',
  useGpu: true,
  transcriptionElevenlabsApiKey: '',
  transcriptionElevenlabsModel: 'scribe_v1',
  transcriptionIncludePunctuation: true,
  transcriptionAlibabaApiKey: '',
  transcriptionAlibabaModel: 'paraformer-realtime-v2',
  transcriptionAlibabaCustomModel: '',
  transcriptionOpenaiApiKey: '',
  transcriptionOpenaiBaseUrl: 'https://api.openai.com/v1',
  transcriptionOpenaiModel: '',
  remoteVidGoHost: '',
  remoteVidGoPort: '9000',
  remoteVidGoUseSsl: false,
  dashscopeApiKey: '',
  ossAccessKeyId: '',
  ossAccessKeySecret: '',
  ossEndpoint: 'oss-cn-beijing.aliyuncs.com',
  ossBucket: 'vidgo-test',
  ossRegion: 'cn-beijing',
})

const loading = ref(false)
const saving = ref(false)
const connectionTesting = ref(false)

const goBack = () => {
  router.push('/')
}

const loadSettings = async () => {
  try {
    loading.value = true
    const configData = await loadConfig()
    Object.assign(settings, configData)
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载设置失败')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    saving.value = true
    await saveConfig(settings)
    
    updateSubtitleSettings({
      fontFamily: settings.fontFamily,
      fontColor: settings.fontColor,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      backgroundStyle: settings.backgroundStyle,
      backgroundColor: settings.backgroundColor,
      borderRadius: settings.borderRadius,
      textShadow: settings.textShadow,
      textStroke: settings.textStroke,
      textStrokeColor: settings.textStrokeColor,
      textStrokeWidth: settings.textStrokeWidth,
      bottomDistance: settings.bottomDistance,
    })

    updateForeignSubtitleSettings({
      fontFamily: settings.foreignFontFamily,
      fontColor: settings.foreignFontColor,
      fontSize: settings.foreignFontSize,
      fontWeight: settings.foreignFontWeight,
      backgroundStyle: settings.foreignBackgroundStyle,
      backgroundColor: settings.foreignBackgroundColor,
      borderRadius: settings.foreignBorderRadius,
      textShadow: settings.foreignTextShadow,
      textStroke: settings.foreignTextStroke,
      textStrokeColor: settings.foreignTextStrokeColor,
      textStrokeWidth: settings.foreignTextStrokeWidth,
      bottomDistance: settings.foreignBottomDistance,
    })

    ElMessage.success('设置已保存')
    localStorage.setItem('lang', settings.rawLanguage)
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  Object.assign(settings, {
    selectedModelProvider: 'deepseek',
    enableThinking: true,
    useProxy: false,
    deepseekApiKey: '',
    deepseekBaseUrl: 'https://api.deepseek.com',
    rawLanguage: 'zh',
  })
  ElMessage.success('已重置为默认设置')
}

const testLLMConnection = async () => {
  connectionTesting.value = true
  try {
    await saveConfig(settings)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const res = await fetch(`${BACKEND}/api/llm-test/`, { credentials: 'include' })
    const data = await res.json()
    if (data.success) {
      ElMessage.success(`测试成功: ${data.response}`)
    } else {
      ElMessage.error(`测试失败: ${data.error}`)
    }
  } catch (err) {
    ElMessage.error(`测试失败: ${err}`)
  } finally {
    connectionTesting.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
