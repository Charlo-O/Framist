<template>
  <div class="h-full bg-paper overflow-y-auto scrollbar-premium">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-paper bg-opacity-90 backdrop-blur-md border-b border-ink border-opacity-5">
      <div class="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <button
            @click="goBack"
            class="p-2 rounded-xl text-ink hover:bg-mint hover:bg-opacity-20 transition-all duration-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl font-display font-bold text-ink">{{ t('settingsTitle') }}</h1>
            <p class="text-mist font-medium mt-1">{{ t('configureExperience') }}</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
            @click="resetSettings"
            :disabled="loading || saving"
            class="btn-ghost text-sm px-6 py-3"
          >
            {{ t('resetToDefault') }}
          </button>
          <button
            @click="saveSettings"
            :disabled="loading || saving"
            class="btn-breathing px-8 py-3 flex items-center shadow-lg shadow-mint/20"
          >
            <span
              v-if="saving"
              class="inline-block w-4 h-4 mr-2 border-2 border-ink border-t-transparent rounded-full animate-spin"
            ></span>
            {{ saving ? t('saving') : t('saveSettings') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-paper bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center">
        <div class="loader-gist"><div class="loader-gist-bar"></div></div>
        <span class="text-mist font-medium mt-6">{{ t('loadingSettings') }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-8 py-10 space-y-12 pb-24">
      
      <!-- LLM Settings -->
      <section class="card-focus bg-white p-8 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h2 class="text-2xl font-display font-bold text-ink mb-8 flex items-center">
          <span class="w-10 h-10 bg-mint bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <span class="text-xl">🤖</span>
          </span>
          {{ t('llmSettings') }}
        </h2>
        
        <div class="space-y-8 pl-14">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('modelSelection') }}</label>
              <div class="relative">
                <select
                  v-model="settings.selectedModelProvider"
                  class="input-framist appearance-none"
                >
                  <option v-for="provider in providerOptions" :key="provider.value" :value="provider.value">
                    {{ provider.label }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('modelName') }}</label>
              <input
                v-model="currentModelName"
                type="text"
                class="input-framist"
                :placeholder="getDefaultModelName()"
              />
              <p class="mt-2 text-xs text-mist font-medium">
                {{ t('defaultLabel') }}: {{ getDefaultModelName() }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-ink mb-2">API Key</label>
            <div class="flex items-center space-x-3">
              <el-input
                v-model="currentApiKey"
                type="password"
                show-password
                placeholder="{{ t('enterApiKey') }}"
                class="flex-1 input-framist-wrapper"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-ink mb-2">Base URL</label>
            <input
              v-model="currentBaseUrl"
              type="url"
              class="input-framist w-full"
              placeholder="API endpoint URL"
            />
          </div>

          <div class="flex items-center space-x-8 pt-4 border-t border-ink border-opacity-5">
            <el-switch
              v-model="settings.useProxy"
              :active-text="t('useProxy')"
              :inactive-text="t('directConnection')"
              class="framist-switch"
            />
            <el-switch
              v-model="settings.enableThinking"
              :active-text="t('enableThinking')"
              :inactive-text="t('standardMode')"
              class="framist-switch"
            />
            <div class="flex-1"></div>
            <button
              @click="testLLMConnection"
              :disabled="connectionTesting"
              class="btn-ghost text-sm px-6 py-2"
            >
              {{ connectionTesting ? t('testing') : t('testConnection') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Interface Settings -->
      <section class="card-focus bg-white p-8 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h2 class="text-2xl font-display font-bold text-ink mb-8 flex items-center">
          <span class="w-10 h-10 bg-mint bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <span class="text-xl">🎨</span>
          </span>
          {{ t('interfaceSettings') }}
        </h2>
        
        <div class="space-y-6 pl-14">
          <div class="max-w-md">
            <label class="block text-sm font-bold text-ink mb-2">{{ t('originalLanguage') }}</label>
            <div class="relative">
              <select
                v-model="settings.rawLanguage"
                class="input-framist appearance-none"
              >
                <option value="zh">中文 (Chinese)</option>
                <option value="en">English</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Subtitle Styling -->
      <section class="card-focus bg-white p-8 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <h2 class="text-2xl font-display font-bold text-ink mb-8 flex items-center">
          <span class="w-10 h-10 bg-mint bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <span class="text-xl">📝</span>
          </span>
          {{ t('subtitleSettings') }}
        </h2>

        <!-- Style Type Toggle -->
        <div class="pl-14 mb-8">
          <div class="inline-flex bg-paper rounded-xl p-1.5 border border-ink border-opacity-5">
            <button
              @click="subtitleType = 'raw'"
              :class="[
                'py-2 px-8 text-sm font-bold rounded-lg transition-all duration-300',
                subtitleType === 'raw'
                  ? 'bg-white text-ink shadow-float'
                  : 'text-mist hover:text-ink',
              ]"
            >
              {{ t('originalSubtitle') }}
            </button>
            <button
              @click="subtitleType = 'foreign'"
              :class="[
                'py-2 px-8 text-sm font-bold rounded-lg transition-all duration-300',
                subtitleType === 'foreign'
                  ? 'bg-white text-ink shadow-float'
                  : 'text-mist hover:text-ink',
              ]"
            >
              {{ t('translatedSubtitle') }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pl-14">
          <!-- Font Family -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">{{ t('fontFamily') }}</label>
            <div class="relative">
              <select
                :value="currentSubtitleSettings.fontFamily"
                @input="updateCurrentSubtitleSettings('fontFamily', ($event.target as HTMLSelectElement).value)"
                class="input-framist appearance-none"
              >
                <option value="宋体">宋体 (SimSun)</option>
                <option value="微软雅黑">微软雅黑 (Microsoft YaHei)</option>
                <option value="Arial">Arial</option>
                <option value="Noto Sans SC">Noto Sans SC</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <!-- Font Color -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">{{ t('fontColor') }}</label>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-xl border border-mist border-opacity-20 overflow-hidden shadow-sm">
                <input
                  type="color"
                  :value="currentSubtitleSettings.fontColor"
                  @input="updateCurrentSubtitleSettings('fontColor', ($event.target as HTMLInputElement).value)"
                  class="w-full h-full p-0 border-0 cursor-pointer transform scale-150"
                />
              </div>
              <span class="font-mono text-mist uppercase">{{ currentSubtitleSettings.fontColor }}</span>
            </div>
          </div>

          <!-- Font Size -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">
              {{ t('fontSize') }}: {{ currentSubtitleSettings.fontSize }}px
            </label>
            <input
              type="range"
              :value="currentSubtitleSettings.fontSize"
              @input="updateCurrentSubtitleSettings('fontSize', parseInt(($event.target as HTMLInputElement).value))"
              min="12"
              max="48"
              class="framist-range w-full"
            />
          </div>

          <!-- Margin Bottom -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">
              {{ t('bottomDistance') }}: {{ bottomDistanceProxy }}px
            </label>
            <input
              type="range"
              v-model="bottomDistanceProxy"
              min="20"
              max="200"
              step="10"
              class="framist-range w-full"
            />
          </div>
        </div>

        <!-- Preview -->
        <div class="mt-8 pl-14">
          <label class="block text-sm font-bold text-ink mb-3">{{ t('realtimePreview') }}</label>
          <div
            class="p-12 border-2 border-dashed border-ink border-opacity-10 rounded-2xl bg-paper flex items-center justify-center relative overflow-hidden"
          >
             <!-- Preview Grid Background -->
             <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#2D2D2D 1px, transparent 1px); background-size: 20px 20px;"></div>
             
             <div
              class="text-center relative z-10 transition-all duration-300"
              :style="{
                fontFamily: currentSubtitleSettings.fontFamily,
                fontSize: currentSubtitleSettings.fontSize + 'px',
                color: currentSubtitleSettings.fontColor,
                fontWeight: currentSubtitleSettings.fontWeight,
                textShadow: currentSubtitleSettings.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
              }"
            >
              {{ currentSubtitleSettings.previewText }}
            </div>
          </div>
        </div>
      </section>

      <!-- Transcription Engine -->
      <section class="card-focus bg-white p-8 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h2 class="text-2xl font-display font-bold text-ink mb-8 flex items-center">
          <span class="w-10 h-10 bg-mint bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <span class="text-xl">🎤</span>
          </span>
          {{ t('transcriptionSettings') }}
        </h2>
        
        <div class="space-y-8 pl-14">
          <div>
            <label class="block text-sm font-bold text-ink mb-2">{{ t('primaryTranscriptionEngine') }}</label>
            <div class="relative">
              <select
                v-model="settings.transcriptionPrimaryEngine"
                class="input-framist appearance-none"
              >
                <option value="whisper_cpp">Whisper.cpp (Local C++/GPU High Performance)</option>
                <option value="elevenlabs">ElevenLabs Speech-to-Text</option>
                <option value="alibaba">Alibaba DashScope</option>
                <option value="openai_whisper">OpenAI Whisper API</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <!-- Whisper.cpp Settings -->
          <div v-if="settings.transcriptionPrimaryEngine === 'whisper_cpp'" class="space-y-6 animate-fade-in-up">
            <div class="p-4 bg-paper rounded-xl border border-ink border-opacity-5">
              <p class="text-sm text-mist leading-relaxed">
                <strong class="text-ink">Whisper.cpp</strong> {{ t('whisperCppDesc') }}
              </p>
            </div>

            <div class="flex items-center justify-between p-4 border border-ink border-opacity-10 rounded-xl">
              <div>
                <span class="text-base font-bold text-ink block">{{ t('gpuAcceleration') }}</span>
                <p class="text-xs text-mist mt-1">
                  {{ settings.useGpu ? t('cudaEnabled') : t('cpuOnlyMode') }}
                </p>
              </div>
              <el-switch v-model="settings.useGpu" class="framist-switch" />
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('modelSize') }}</label>
              <div class="relative">
                <select
                  v-model="settings.fwsrModel"
                  class="input-framist appearance-none"
                >
                  <option value="tiny">tiny (~75 MB)</option>
                  <option value="base">base (~142 MB)</option>
                  <option value="small">small (~466 MB)</option>
                  <option value="medium">medium (~1.5 GB)</option>
                  <option value="large-v3">large-v3 (~3.1 GB) {{ t('recommended') }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Alibaba DashScope Settings -->
          <div v-if="settings.transcriptionPrimaryEngine === 'alibaba'" class="space-y-6 animate-fade-in-up">
             <div class="p-4 bg-paper rounded-xl border border-ink border-opacity-5">
              <p class="text-sm text-mist leading-relaxed">
                <strong class="text-ink">Alibaba DashScope</strong> {{ t('alibabaDesc') }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">API Key</label>
              <el-input
                v-model="settings.transcriptionAlibabaApiKey"
                type="password"
                show-password
                placeholder="DashScope API Key"
                class="input-framist-wrapper"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('model') }}</label>
              <div class="relative">
                <select
                  v-model="settings.transcriptionAlibabaModel"
                  class="input-framist appearance-none"
                >
                  <option value="paraformer-realtime-v2">Paraformer Realtime v2 ({{ t('recommended') }})</option>
                  <option value="paraformer-v2">Paraformer v2</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('customModelName') }}</label>
              <input
                v-model="settings.transcriptionAlibabaCustomModel"
                type="text"
                class="input-framist"
                :placeholder="settings.transcriptionAlibabaModel || 'paraformer-realtime-v2'"
              />
              <p class="mt-2 text-xs text-mist">{{ t('overrideModelIdNote') }}</p>
            </div>
          </div>

          <!-- OpenAI Whisper Settings -->
          <div v-if="settings.transcriptionPrimaryEngine === 'openai_whisper'" class="space-y-6 animate-fade-in-up">
            <div class="p-4 bg-paper rounded-xl border border-ink border-opacity-5">
              <p class="text-sm text-mist leading-relaxed">
                <strong class="text-ink">OpenAI Whisper</strong> {{ t('openaiWhisperDesc') }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">API Key</label>
              <el-input
                v-model="settings.transcriptionOpenaiApiKey"
                type="password"
                show-password
                placeholder="OpenAI API Key"
                class="input-framist-wrapper"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">Base URL</label>
              <input
                v-model="settings.transcriptionOpenaiBaseUrl"
                type="url"
                class="input-framist"
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-ink mb-2">{{ t('modelName') }}</label>
              <input
                v-model="settings.transcriptionOpenaiModel"
                type="text"
                class="input-framist"
                placeholder="whisper-1"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Credentials -->
      <section class="card-focus bg-white p-8 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h2 class="text-2xl font-display font-bold text-ink mb-8 flex items-center">
          <span class="w-10 h-10 bg-mint bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <span class="text-xl">🔑</span>
          </span>
          {{ t('mediaCredentials') }}
        </h2>
        
        <div class="space-y-8 pl-14">
          <!-- Bilibili -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">Bilibili SessData</label>
            <el-input
              v-model="settings.bilibiliSessData"
              type="password"
              show-password
              placeholder="SessData for high-quality downloads"
              class="input-framist-wrapper"
            />
          </div>

          <!-- Aliyun OSS -->
           <div class="pt-6 border-t border-ink border-opacity-5">
            <h3 class="text-lg font-bold text-ink mb-2">Aliyun OSS</h3>
            <p class="text-sm text-mist mb-6">{{ t('ossDescription') }}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-ink mb-2">Access Key ID</label>
                <input
                  v-model="settings.ossAccessKeyId"
                  type="text"
                  class="input-framist"
                  placeholder="LTAI..."
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-ink mb-2">Access Key Secret</label>
                <input
                  v-model="settings.ossAccessKeySecret"
                  type="password"
                  class="input-framist"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-ink mb-2">Endpoint</label>
                <input
                  v-model="settings.ossEndpoint"
                  type="text"
                  class="input-framist"
                  placeholder="oss-cn-beijing.aliyuncs.com"
                />
              </div>

               <div>
                <label class="block text-sm font-bold text-ink mb-2">{{ t('bucketName') }}</label>
                <input
                  v-model="settings.ossBucket"
                  type="text"
                  class="input-framist"
                  placeholder="my-bucket"
                />
              </div>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  remoteVidGoPort: '8000',
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
