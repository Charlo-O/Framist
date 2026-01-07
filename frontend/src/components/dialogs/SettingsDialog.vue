<template>
  <div
    v-if="showSetting"
    class="fixed inset-0 bg-ink bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
    @click.self="showSetting = false"
  >
    <div class="bg-paper rounded-3xl shadow-2xl w-[900px] h-[700px] flex overflow-hidden border border-white border-opacity-50">
      <!-- Left Sidebar -->
      <div class="w-64 bg-white border-r border-ink border-opacity-5 flex flex-col">
        <div class="p-6">
          <h2 class="text-xl font-display font-bold text-ink mb-2">Settings</h2>
          <p class="text-xs text-mist font-medium mb-6">Application Preferences</p>
          <nav class="space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200',
                activeTab === tab.id 
                  ? 'bg-mint/10 text-mint shadow-lg shadow-mint/10 scale-105' 
                  : 'text-mist hover:text-ink hover:bg-paper',
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>
        <div class="mt-auto p-6 border-t border-ink border-opacity-5">
          <div class="flex items-center space-x-3">
             <div class="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-ink font-bold text-xs">V</div>
             <div class="text-xs text-mist">
                <div class="font-bold text-ink">Framist App</div>
                <div>v1.0.0</div>
             </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col bg-paper">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-ink border-opacity-5 bg-white bg-opacity-50 backdrop-blur-md">
          <h3 class="text-xl font-display font-bold text-ink">
            {{ tabs.find((t) => t.id === activeTab)?.label }}
          </h3>
          <button @click="closeDialog" class="p-2 rounded-xl text-mist hover:text-coral hover:bg-coral hover:bg-opacity-10 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-8 overflow-y-auto scrollbar-premium relative">
          <!-- Loading overlay -->
          <div
            v-if="loading"
            class="absolute inset-0 bg-paper bg-opacity-90 flex items-center justify-center z-10 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center">
               <div class="loader-gist w-32"><div class="loader-gist-bar"></div></div>
               <span class="text-mist font-medium mt-4">{{ t('loadingSettings') }}</span>
            </div>
          </div>
          <!-- Model Settings -->
          <div v-if="activeTab === 'model'" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('apiKey') }}</label>
              <div class="flex items-center space-x-2">
                <el-input
                  v-model="currentApiKey"
                  type="password"
                  show-password
                  :placeholder="t('enterApiKey')"
                  class="flex-1"
                />
                <button
                  @click="copyToClipboard(currentApiKey)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 whitespace-nowrap"
                >
                  {{ t('copy') }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('baseUrl') }}</label>
              <input
                v-model="currentBaseUrl"
                type="url"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="输入API基础URL"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">模型提供商选择</label>
              <select
                v-model="settings.selectedModelProvider"
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option
                  v-for="provider in providerOptions"
                  :key="provider.value"
                  :value="provider.value"
                >
                  {{ provider.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">模型名称</label>
              <input
                v-model="currentModelName"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
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
                class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ connectionTesting ? '测试中...' : '测试连接' }}
              </button>
            </div>
          </div>

          <!-- Interface Settings -->
          <!-- Interface Settings -->
          <div v-if="activeTab === 'interface'" class="space-y-8 animate-fade-in-up">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5">
              <label class="block text-sm font-bold text-ink mb-2">原始语言</label>
              <div class="relative">
                <select
                  v-model="settings.rawLanguage"
                  class="input-framist appearance-none"
                >
                  <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </option>
                </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div v-if="props.categories && props.categories.length > 0" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5">
              <label class="block text-sm font-bold text-ink mb-2">隐藏分类</label>
              <div class="relative input-framist-wrapper">
                <el-select
                  v-model="settings.hiddenCategories"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="选择要隐藏的分类"
                  style="width: 100%"
                >
                  <el-option
                    v-for="category in props.categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </div>
              <p class="mt-2 text-xs text-mist font-medium">
                选中的分类及其包含的合集和视频将在侧边栏和媒体库中隐藏
              </p>
            </div>
          </div>

          <!-- Subtitle Settings -->
          <div v-if="activeTab === 'subtitle'" class="space-y-8 animate-fade-in-up">
               <!-- Toggle -->
                <div class="flex justify-center mb-6">
                 <div class="inline-flex bg-white rounded-xl p-1.5 border border-ink border-opacity-5 shadow-sm">
                  <button
                    @click="subtitleType = 'raw'"
                    :class="[
                      'py-2 px-6 text-sm font-bold rounded-lg transition-all duration-300',
                      subtitleType === 'raw'
                        ? 'bg-ink text-mint shadow-md'
                        : 'text-mist hover:text-ink',
                    ]"
                  >
                   Raw
                  </button>
                  <button
                    @click="subtitleType = 'foreign'"
                     :class="[
                      'py-2 px-6 text-sm font-bold rounded-lg transition-all duration-300',
                      subtitleType === 'foreign'
                        ? 'bg-ink text-mint shadow-md'
                        : 'text-mist hover:text-ink',
                    ]"
                  >
                    Translated
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                 <div>
                  <label class="block text-sm font-bold text-ink mb-2">{{ t('fontFamily') }}</label>
                   <div class="relative">
                    <select
                      :value="currentSubtitleSettings.fontFamily"
                      @input="updateCurrentSubtitleSettings('fontFamily', ($event.target as HTMLSelectElement).value)"
                       class="input-framist appearance-none"
                    >
                      <option value="宋体">宋体</option>
                      <option value="微软雅黑">微软雅黑</option>
                      <option value="Arial">Arial</option>
                      <option value="Noto Sans SC">Noto Sans SC</option>
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                   <label class="block text-sm font-bold text-ink mb-2">Preview Text</label>
                   <input
                    :value="currentSubtitleSettings.previewText"
                    @input="
                      updateCurrentSubtitleSettings(
                        'previewText',
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                    class="input-framist"
                    placeholder="Subtitle preview text"
                  />
                </div>
              </div>

                <div>
                   <label class="block text-sm font-bold text-ink mb-2">{{ t('fontColor') }}</label>
                   <div class="flex items-center space-x-4 mb-4">
                      <div class="w-12 h-12 rounded-2xl border border-mist border-opacity-20 overflow-hidden shadow-sm relative group">
                        <input
                          type="color"
                          :value="currentSubtitleSettings.fontColor"
                          @input="updateCurrentSubtitleSettings('fontColor', ($event.target as HTMLInputElement).value)"
                          class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 border-0 cursor-pointer"
                        />
                      </div>
                      <span class="font-mono text-sm text-ink font-bold uppercase bg-white px-3 py-1 rounded-lg border border-mist border-opacity-20">{{ currentSubtitleSettings.fontColor }}</span>
                   </div>
                   <div class="flex space-x-3">
                    <button
                      v-for="color in colorPresets"
                      :key="color"
                      @click="updateCurrentSubtitleSettings('fontColor', color)"
                      :style="{ backgroundColor: color }"
                      class="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                    ></button>
                  </div>
                </div>

                 <div class="col-span-2">
                   <div class="flex justify-between items-center mb-2">
                      <label class="block text-sm font-bold text-ink">
                        {{ t('fontSize') }}
                      </label>
                      <span class="text-xs font-bold text-mint bg-ink px-2 py-0.5 rounded-md">{{ currentSubtitleSettings.fontSize }}px</span>
                   </div>
                  <input
                    type="range"
                    :value="currentSubtitleSettings.fontSize"
                    @input="updateCurrentSubtitleSettings('fontSize', parseInt(($event.target as HTMLInputElement).value))"
                    min="12"
                    max="48"
                    class="framist-range"
                  />
                  <div class="flex justify-between text-[10px] text-mist font-bold mt-2 uppercase tracking-wider">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                    <span>Extra Large</span>
                  </div>
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-bold text-ink mb-2">{{ t('fontWeight') }}</label>
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="weight in fontWeights"
                      :key="weight.value"
                      @click="updateCurrentSubtitleSettings('fontWeight', weight.value)"
                      :class="[
                        'px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all duration-200',
                        currentSubtitleSettings.fontWeight === weight.value
                          ? 'bg-ink text-mint border-ink shadow-lg'
                          : 'bg-white text-mist border-mist border-opacity-20 hover:border-ink hover:text-ink',
                      ]"
                    >
                      {{ weight.label }}
                    </button>
                  </div>
                </div>

                <div class="col-span-2 space-y-4">
                   <div class="p-4 bg-white rounded-2xl border border-ink border-opacity-5">
                      <div class="flex items-center justify-between mb-4">
                        <span class="text-sm font-bold text-ink">Display Settings</span>
                      </div>
                      
                      <div>
                        <label class="block text-xs font-bold text-mist uppercase tracking-wider mb-2">Background</label>
                        <div class="relative">
                          <select
                            v-model="backgroundStyleProxy"
                            class="input-framist appearance-none"
                          >
                            <option value="none">None</option>
                            <option value="semi-transparent">Semi-Transparent</option>
                            <option value="solid">Solid</option>
                          </select>
                           <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                      </div>
                   </div>
                </div>

                <!-- Bottom Distance -->
                <div>
                   <div class="flex justify-between items-center mb-2">
                      <label class="block text-sm font-bold text-ink">Bottom Distance</label>
                      <span class="text-xs font-bold text-mint bg-ink px-2 py-0.5 rounded-md">{{ bottomDistanceProxy }}px</span>
                   </div>
                  <div class="flex items-center space-x-3">
                    <input
                      type="range"
                      v-model="bottomDistanceProxy"
                      min="20"
                      max="200"
                      step="10"
                      class="framist-range flex-1"
                    />
                  </div>
                </div>

                 <!-- Background Styling (Conditional) -->
                 <div v-if="backgroundStyleProxy !== 'none'" class="space-y-4 pt-4 border-t border-mist border-opacity-10 animate-fade-in-up">
                    <div>
                      <label class="block text-sm font-bold text-ink mb-2">Background Color</label>
                       <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 rounded-lg border border-mist border-opacity-20 overflow-hidden shadow-sm relative group">
                           <input
                            type="color"
                            :value="currentSubtitleSettings.backgroundColor"
                            @input="updateCurrentSubtitleSettings('backgroundColor', ($event.target as HTMLInputElement).value)"
                            class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                          />
                        </div>
                        <span class="font-mono text-xs text-mist uppercase">{{ currentSubtitleSettings.backgroundColor }}</span>
                     </div>
                    </div>
                     <div>
                       <div class="flex justify-between items-center mb-2">
                          <label class="block text-sm font-bold text-ink">Corner Radius</label>
                          <span class="text-xs font-bold text-mint bg-ink px-2 py-0.5 rounded-md">{{ currentSubtitleSettings.borderRadius }}px</span>
                       </div>
                      <input
                        type="range"
                        :value="currentSubtitleSettings.borderRadius"
                         @input="updateCurrentSubtitleSettings('borderRadius', parseInt(($event.target as HTMLInputElement).value))"
                        min="0"
                        max="20"
                        class="framist-range"
                      />
                    </div>
                 </div>


            <div class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-ink">Text Shadow</span>
                 <el-switch
                    :model-value="currentSubtitleSettings.textShadow"
                    @change="(val: boolean | string | number) => updateCurrentSubtitleSettings('textShadow', Boolean(val))"
                    class="framist-switch"
                  />
              </div>

              <!-- Text Stroke Controls -->
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-ink">Text Stroke</span>
                 <el-switch
                    :model-value="currentSubtitleSettings.textStroke"
                    @change="(val: boolean | string | number) => updateCurrentSubtitleSettings('textStroke', Boolean(val))"
                    class="framist-switch"
                  />
              </div>
              
               <!-- Text Stroke Color -->
              <div v-if="currentSubtitleSettings.textStroke" class="animate-fade-in-up space-y-4 pt-4 border-t border-mist border-opacity-10">
                  <div class="flex items-center justify-between">
                     <span class="text-sm font-bold text-ink">Stroke Color</span>
                      <div class="flex items-center space-x-2">
                         <div class="w-8 h-8 rounded-lg border border-mist border-opacity-20 overflow-hidden shadow-sm relative group">
                           <input
                            type="color"
                            :value="currentSubtitleSettings.textStrokeColor"
                            @input="updateCurrentSubtitleSettings('textStrokeColor', ($event.target as HTMLInputElement).value)"
                            class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                          />
                        </div>
                      </div>
                  </div>
                   <div>
                       <div class="flex justify-between items-center mb-2">
                          <span class="text-sm font-bold text-ink">Stroke Width</span>
                          <span class="text-xs font-bold text-mint bg-ink px-2 py-0.5 rounded-md">{{ currentSubtitleSettings.textStrokeWidth }}px</span>
                       </div>
                      <input
                        type="range"
                        :value="currentSubtitleSettings.textStrokeWidth"
                         @input="updateCurrentSubtitleSettings('textStrokeWidth', parseInt(($event.target as HTMLInputElement).value))"
                        min="1"
                        max="10"
                        class="framist-range"
                      />
                    </div>
               </div>
            </div>

            <!-- Preview box -->
            <div
                class="mt-6 p-8 border-2 border-dashed border-ink border-opacity-10 rounded-2xl bg-paper flex items-center justify-center relative overflow-hidden"
              >
                 <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#2D2D2D 1px, transparent 1px); background-size: 20px 20px;"></div>
                 <div
                  class="text-center relative z-10"
                  :style="{
                    fontFamily: currentSubtitleSettings.fontFamily,
                    fontSize: currentSubtitleSettings.fontSize + 'px',
                    color: currentSubtitleSettings.fontColor,
                    fontWeight: currentSubtitleSettings.fontWeight,
                    textShadow: currentSubtitleSettings.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                    webkitTextStroke: currentSubtitleSettings.textStroke ? `${currentSubtitleSettings.textStrokeWidth}px ${currentSubtitleSettings.textStrokeColor}` : 'none',
                    backgroundColor: backgroundStyleProxy === 'solid' ? currentSubtitleSettings.backgroundColor : backgroundStyleProxy === 'semi-transparent' ? `${currentSubtitleSettings.backgroundColor}80` : 'transparent',
                    borderRadius: currentSubtitleSettings.borderRadius + 'px',
                    padding: backgroundStyleProxy !== 'none' ? '4px 8px' : '0'
                  } as any"
                >
                  {{ currentSubtitleSettings.previewText }}
                </div>
              </div>
              <p class="text-xs text-mist text-center mt-2">
                Preview reflects {{ subtitleType === 'raw' ? 'Original' : 'Translated' }} subtitle settings
              </p>

            <!-- Aspect Ratio Preview Buttons -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4">
              <label class="block text-sm font-bold text-ink">Video Layout Preview</label>
              <div class="flex space-x-4">
                <button
                  @click="showPreviewModal('16:9')"
                   class="flex-1 btn-ghost py-3 rounded-xl flex items-center justify-center space-x-2 border-2 border-dashed border-ink border-opacity-10 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50"
                >
                  <span class="font-bold">16:9 Landscape</span>
                </button>
                <button
                  @click="showPreviewModal('3:4')"
                   class="flex-1 btn-ghost py-3 rounded-xl flex items-center justify-center space-x-2 border-2 border-dashed border-ink border-opacity-10 hover:border-green-500 hover:text-green-500 hover:bg-green-50"
                >
                   <span class="font-bold">3:4 Portrait</span>
                </button>
              </div>
              <p class="text-xs text-mist text-center">Preview hardcoded subtitle placement on video</p>
            </div>

            <!-- Preview Modal -->
            <div
              v-if="showPreview"
              class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
              @click.self="closePreview"
            >
              <div class="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold">{{ previewAspectRatio }} 字幕预览</h3>
                  <button @click="closePreview" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>

                <!-- Preview Container -->
                <div
                  class="relative bg-gray-800 mx-auto flex items-center justify-center"
                  :style="{
                    width: previewAspectRatio === '16:9' ? '640px' : '300px',
                    height: previewAspectRatio === '16:9' ? '360px' : '400px',
                  }"
                >
                  <!-- Background Text -->
                  <div class="text-gray-500 text-xl font-bold select-none">
                    {{ previewAspectRatio === '16:9' ? '1920*1080' : '1080*1440' }}
                  </div>

                  <!-- Raw Subtitle (原文字幕) -->
                  <div
                    class="absolute text-center px-2"
                    :style="{
                      bottom: settings.bottomDistance + 'px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily: settings.fontFamily,
                      fontSize:
                        (previewAspectRatio === '16:9'
                          ? settings.fontSize
                          : settings.fontSize * 0.8) + 'px',
                      color: settings.fontColor,
                      fontWeight: settings.fontWeight,
                      backgroundColor:
                        settings.backgroundStyle === 'solid'
                          ? settings.backgroundColor
                          : settings.backgroundStyle === 'semi-transparent'
                            ? settings.backgroundColor + '80'
                            : 'transparent',
                      borderRadius: settings.borderRadius + 'px',
                      textShadow: settings.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                      padding: settings.backgroundStyle !== 'none' ? '4px 8px' : '0',
                    }"
                  >
                    Example content Example content Example content
                  </div>

                  <!-- Foreign Subtitle (外文字幕) -->
                  <div
                    class="absolute text-center px-2"
                    :style="{
                      bottom: settings.foreignBottomDistance + 'px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily: settings.foreignFontFamily,
                      fontSize:
                        (previewAspectRatio === '16:9'
                          ? settings.foreignFontSize
                          : settings.foreignFontSize * 0.8) + 'px',
                      color: settings.foreignFontColor,
                      fontWeight: settings.foreignFontWeight,
                      backgroundColor:
                        settings.foreignBackgroundStyle === 'solid'
                          ? settings.foreignBackgroundColor
                          : settings.foreignBackgroundStyle === 'semi-transparent'
                            ? settings.foreignBackgroundColor + '80'
                            : 'transparent',
                      borderRadius: settings.foreignBorderRadius + 'px',
                      textShadow: settings.foreignTextShadow
                        ? '2px 2px 4px rgba(0,0,0,0.5)'
                        : 'none',
                      padding: settings.foreignBackgroundStyle !== 'none' ? '4px 8px' : '0',
                    }"
                  >
                    这是一段示例文本
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- OSS Service Settings -->
          <div v-if="activeTab === 'oss'" class="space-y-8 animate-fade-in-up">
            <div class="bg-paper p-6 rounded-2xl border border-ink border-opacity-5">
              <div class="flex items-start mb-6">
                <div class="bg-mint bg-opacity-20 p-2 rounded-lg mr-4 text-ink">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h4 class="text-lg font-bold text-ink mb-1">Aliyun OSS Config</h4>
                  <p class="text-sm text-mist">
                    Configure Aliyun OSS credentials to enable audio cloning. Reference audio will be stored in your OSS Bucket.
                  </p>
                </div>
              </div>

               <div class="grid grid-cols-2 gap-6">
                 <div class="col-span-2">
                  <label class="block text-sm font-bold text-ink mb-2">Access Key ID</label>
                  <input
                    v-model="settings.ossAccessKeyId"
                    type="text"
                    class="input-framist"
                    placeholder="Enter your Aliyun Access Key ID"
                  />
                  </div>
                   <div class="col-span-2">
                  <label class="block text-sm font-bold text-ink mb-2">Access Key Secret</label>
                   <input
                    v-model="settings.ossAccessKeySecret"
                    type="password"
                     class="input-framist"
                    placeholder="Enter your Aliyun Access Key Secret"
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
                   <label class="block text-sm font-bold text-ink mb-2">Bucket Name</label>
                    <input
                      v-model="settings.ossBucket"
                       type="text"
                      class="input-framist"
                      placeholder="vidgo-test"
                    />
                  </div>
                   <div class="col-span-2">
                   <label class="block text-sm font-bold text-ink mb-2">Region</label>
                    <input
                      v-model="settings.ossRegion"
                       type="text"
                      class="input-framist"
                      placeholder="cn-beijing"
                    />
                  </div>
               </div>
                <p class="text-xs text-mist mt-4 italic">
                Note: Access Key Secrets are stored encrypted. Ensure you use RAM user credentials with appropriate permissions.
              </p>
            </div>
          </div>
          
           <!-- TTS Settings -->
           <div v-if="activeTab === 'tts'" class="space-y-8 animate-fade-in-up">
            <div class="bg-paper p-6 rounded-2xl border border-ink border-opacity-5">
               <div class="flex items-start mb-6">
                <div class="bg-mint bg-opacity-20 p-2 rounded-lg mr-4 text-ink">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </div>
                 <div>
                  <h4 class="text-lg font-bold text-ink mb-1">TTS Config</h4>
                  <p class="text-sm text-mist">
                    Configure Alibaba Cloud DashScope credentials to enable TTS generation.
                  </p>
                </div>
              </div>

               <div class="space-y-6">
                  <div>
                  <label class="block text-sm font-bold text-ink mb-2">DashScope API Key</label>
                  <div class="flex items-center space-x-3">
                   <input
                    v-model="settings.dashscopeApiKey"
                    type="password"
                     class="input-framist flex-1"
                    placeholder="Enter your DashScope API Key"
                  />
                  <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank" class="btn-ghost flex items-center px-4 py-2 text-xs">
                     Console <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                  </div>
                  </div>
                </div>
            </div>
          </div>

          <!-- Transcription Engine Settings -->
          <div v-if="activeTab === 'transcription'" class="space-y-8 animate-fade-in-up">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5">
              <label class="block text-sm font-bold text-ink mb-2">Transcription Engine</label>
              <div class="relative">
                <select
                  v-model="settings.transcriptionPrimaryEngine"
                  class="input-framist appearance-none"
                >
                  <option v-for="engine in allTranscriptionEngines" :key="engine.value" :value="engine.value">
                    {{ engine.label }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Whisper.cpp Specific Settings -->
            <div v-if="settings.transcriptionPrimaryEngine === 'whisper_cpp'" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-6">
              <div class="flex items-center space-x-3 mb-4">
                 <div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">W</div>
                 <div>
                    <h4 class="text-lg font-bold text-ink">Whisper.cpp</h4>
                    <p class="text-xs text-mist">Use local GPU for fast transcription</p>
                 </div>
              </div>
              
               <div class="flex items-center justify-between p-4 bg-paper rounded-xl border border-ink border-opacity-5">
                <div>
                  <span class="text-sm font-bold text-ink">🚀 Enable GPU Acceleration</span>
                  <p class="text-xs text-mist mt-1">
                    {{ settings.useGpu
                       ? 'CUDA GPU (NVIDIA)'
                       : 'CPU-only (Slower)' }}
                  </p>
                </div>
                 <el-switch
                    v-model="settings.useGpu"
                    active-text="GPU"
                    class="framist-switch"
                  />
              </div>
            </div>

            <!-- Alibaba DashScope Specific Settings -->
            <div v-if="settings.transcriptionPrimaryEngine === 'alibaba_dashscope'" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-6">
                 <div class="flex items-center space-x-3 mb-4">
                 <div class="w-10 h-10 bg-[#FF6A00] rounded-xl flex items-center justify-center text-white font-bold">A</div>
                 <div>
                    <h4 class="text-lg font-bold text-ink">Alibaba DashScope</h4>
                    <p class="text-xs text-mist">Cloud-based High Accuracy ASR</p>
                 </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">Model</label>
                 <input
                    v-model="settings.transcriptionAlibabaCustomModel"
                    type="text"
                    class="input-framist"
                    placeholder="paraformer-v1"
                  />
                  <p class="text-xs text-mist mt-1">Default: paraformer-v1</p>
              </div>
            </div>

            <!-- OpenAI Whisper Specific Settings -->
             <div v-if="settings.transcriptionPrimaryEngine === 'openai_whisper'" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-6">
               <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 bg-[#10A37F] rounded-xl flex items-center justify-center text-white font-bold">O</div>
                 <div>
                    <h4 class="text-lg font-bold text-ink">OpenAI Whisper</h4>
                    <p class="text-xs text-mist">Official OpenAI API</p>
                 </div>
              </div>
               <div>
                  <label class="block text-sm font-bold text-ink mb-2">Model</label>
                  <input
                    v-model="settings.transcriptionOpenaiModel"
                    type="text"
                    class="input-framist"
                    placeholder="whisper-1"
                  />
                  <p class="text-xs text-mist mt-1">Default: whisper-1</p>
               </div>
            </div>


              <!-- Model Selection -->
               <div v-if="settings.transcriptionPrimaryEngine === 'whisper_cpp'" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4">
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-bold text-ink">GGML Model</label>
                    <button
                      @click="loadAvailableModels"
                      class="btn-ghost flex items-center px-3 py-1.5 text-xs"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                       Refresh
                    </button>
                  </div>
                   <div class="relative">
                    <select
                      v-model="settings.fwsrModel"
                      class="input-framist appearance-none"
                    >
                      <option v-for="model in availableModels" :key="model.name" :value="model.name">
                        {{ model.name }} ({{ model.size }})
                        {{ model.downloaded ? '✅' : model.downloading ? '⏳' : '⬇️' }}
                      </option>
                    </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
                  <p class="mt-2 text-xs text-mist font-medium">
                    Run `bash scripts/download_whisper_models.sh` to download GGML models manually.
                  </p>

                  <!-- Warning for distil-large-v3 -->
                  <div
                    v-if="settings.fwsrModel === 'distil-large-v3'"
                    class="p-4 bg-orange-50 border border-orange-200 rounded-xl animate-fade-in-up"
                  >
                    <div class="flex items-start">
                      <svg
                        class="w-5 h-5 text-orange-400 mt-0.5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <div>
                        <p class="text-sm font-bold text-orange-800">Note: English Only Model</p>
                        <p class="text-xs text-orange-700 mt-1">
                          distil-large-v3 is optimized for English transcription only. For Chinese or other languages, please use large-v3 or medium models.
                        </p>
                      </div>
                    </div>
                  </div>

                 <!-- Model Download Section -->
                 <div
                    v-if="!isCurrentModelDownloaded"
                    class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                  >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-yellow-800">
                    模型 "{{ settings.fwsrModel }}" 尚未下载
                  </span>
                  <div class="flex gap-2">
                    <button
                      @click="checkModelSize(settings.fwsrModel)"
                      :disabled="isCheckingSize"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm"
                    >
                      {{ isCheckingSize ? '检查中...' : '检查大小' }}
                    </button>
                    <button
                      @click="downloadModel(settings.fwsrModel)"
                      :disabled="isDownloading"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm"
                    >
                      {{ isDownloading ? '下载中...' : '下载模型' }}
                    </button>
                  </div>
                </div>
                <div
                  v-if="isDownloading"
                  class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded"
                >
                  <p class="text-sm text-blue-700">⏳ 模型正在后台下载，请耐心等待...</p>
                </div>
                <div
                  v-if="modelSizeInfo"
                  class="mt-2 p-2 bg-gray-50 border border-gray-200 rounded"
                >
                  <p class="text-sm text-gray-700">📁 当前模型大小: {{ modelSizeInfo }}</p>
                </div>
              </div>
            </div>

            <!-- ElevenLabs Settings -->
            <div v-if="needsElevenlabsConfig" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4 animate-fade-in-up">
              <div class="flex items-center space-x-3 mb-2">
                 <div class="w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-white font-bold text-xs">XI</div>
                 <h4 class="text-lg font-bold text-ink">ElevenLabs Config</h4>
              </div>
              
              <div>
                <label class="block text-sm font-bold text-ink mb-2">API Key</label>
                <div class="flex items-center space-x-3">
                  <el-input
                    v-model="settings.transcriptionElevenlabsApiKey"
                    type="password"
                    show-password
                    placeholder="Enter ElevenLabs API Key"
                    class="input-framist-wrapper flex-1"
                  />
                  <button
                    @click="copyToClipboard(settings.transcriptionElevenlabsApiKey)"
                    class="btn-ghost p-2"
                  >
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">Model</label>
                <div class="relative">
                  <select
                    v-model="settings.transcriptionElevenlabsModel"
                    class="input-framist appearance-none"
                  >
                    <option value="scribe_v1">Scribe v1</option>
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-paper rounded-xl border border-ink border-opacity-5">
                <span class="text-sm font-bold text-ink">Include Punctuation</span>
                 <el-switch
                    v-model="settings.transcriptionIncludePunctuation"
                    class="framist-switch"
                  />
              </div>
            </div>

            <!-- Alibaba DashScope Settings -->
            <div v-if="needsAlibabaConfig" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4 animate-fade-in-up">
               <div class="flex items-center space-x-3 mb-2">
                 <div class="w-8 h-8 bg-[#FF6A00] rounded-lg flex items-center justify-center text-white font-bold text-xs">DS</div>
                 <h4 class="text-lg font-bold text-ink">DashScope Config</h4>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">API Key</label>
                <div class="flex items-center space-x-3">
                  <el-input
                    v-model="settings.transcriptionAlibabaApiKey"
                    type="password"
                    show-password
                    placeholder="Enter Alibaba API Key"
                     class="input-framist-wrapper flex-1"
                  />
                  <button
                    @click="copyToClipboard(settings.transcriptionAlibabaApiKey)"
                     class="btn-ghost p-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">Model</label>
                 <div class="relative">
                  <select
                    v-model="settings.transcriptionAlibabaModel"
                    class="input-framist appearance-none"
                  >
                    <option value="paraformer-realtime-v2">Paraformer Realtime v2</option>
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- OpenAI Whisper Settings -->
            <div v-if="needsOpenaiConfig" class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4 animate-fade-in-up">
               <div class="flex items-center space-x-3 mb-2">
                 <div class="w-8 h-8 bg-[#10A37F] rounded-lg flex items-center justify-center text-white font-bold text-xs">OP</div>
                 <h4 class="text-lg font-bold text-ink">OpenAI Whisper Config</h4>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">API Key</label>
                <div class="flex items-center space-x-3">
                  <el-input
                    v-model="settings.transcriptionOpenaiApiKey"
                    type="password"
                    show-password
                    placeholder="Enter OpenAI API Key"
                     class="input-framist-wrapper flex-1"
                  />
                  <button
                    @click="copyToClipboard(settings.transcriptionOpenaiApiKey)"
                     class="btn-ghost p-2"
                  >
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-ink mb-2">{{ t('baseUrl') }}</label>
                <input
                  v-model="settings.transcriptionOpenaiBaseUrl"
                  type="url"
                  class="input-framist"
                  placeholder="https://api.openai.com/v1"
                />
              </div>
            </div>

            <!-- Remote VidGo Service Settings -->
            <div
              v-if="needsRemoteVidGoConfig"
              class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-6 animate-fade-in-up"
            >
              <div class="flex items-start mb-4">
                 <div class="bg-blue-100 p-2 rounded-lg mr-4 text-ink">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                 </div>
                 <div>
                    <h4 class="text-lg font-bold text-ink mb-1">Remote VidGo Service</h4>
                     <p class="text-sm text-mist">
                      Connect to a backend VidGo instance hosted on a powerful machine for subtitle recognition.
                    </p>
                 </div>
              </div>

               <div class="grid grid-cols-2 gap-6">
                 <div class="col-span-2">
                  <label class="block text-sm font-bold text-ink mb-2">Host Address</label>
                  <input
                    v-model="settings.remoteVidGoHost"
                    type="text"
                    class="input-framist"
                    placeholder="e.g. 192.168.1.100 or vidgo.example.com"
                  />
                  </div>
                   <div>
                   <label class="block text-sm font-bold text-ink mb-2">Port</label>
                    <input
                      v-model="settings.remoteVidGoPort"
                      type="number"
                      class="input-framist"
                      placeholder="8000"
                    />
                  </div>
              </div>
                <div class="flex items-center justify-between p-4 bg-paper rounded-xl border border-ink border-opacity-5">
                   <div>
                    <span class="text-sm font-bold text-ink">Enable SSL (HTTPS)</span>
                    <p class="text-xs text-mist mt-1">If using domain name, usually no port needed (443)</p>
                   </div>
                   <el-switch
                      v-model="settings.remoteVidGoUseSsl"
                      class="framist-switch"
                    />
                </div>
            </div>

            <!-- Engine Info Section -->
            <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div class="flex items-start">
                 <div class="flex-shrink-0 text-blue-400">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div class="ml-3">
                    <h3 class="text-sm font-bold text-blue-800">Engine Details</h3>
                    <div class="mt-2 text-xs text-blue-700 space-y-1">
                       <p><strong>Whisper.cpp:</strong> Local processing, GPU support, Private, Free.</p>
                       <p><strong>ElevenLabs:</strong> High quality, Multi-lingual, Paid (~$0.01/min).</p>
                       <p><strong>Alibaba DashScope:</strong> Best for Chinese, Paid (~$0.002/min).</p>
                       <p><strong>OpenAI Whisper:</strong> Official API, High quality, Paid (~$0.006/min).</p>
                       <p><strong>Remote VidGo:</strong> Private cloud processing, No local GPU needed.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Media Credentials Settings -->
          <div v-if="activeTab === 'media'" class="space-y-8 animate-fade-in-up">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-ink border-opacity-5 space-y-4">
               <div>
                  <h4 class="text-lg font-bold text-ink mb-2">Bilibili Credentials</h4>
                  <label class="block text-sm font-bold text-ink mb-2">SessData</label>
                  <div class="flex items-center space-x-3">
                    <el-input
                      v-model="settings.bilibiliSessData"
                      type="password"
                      show-password
                      placeholder="Enter Bilibili SessData"
                      class="input-framist-wrapper flex-1"
                    />
                    <button
                      @click="copyToClipboard(settings.bilibiliSessData)"
                      class="btn-ghost p-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  </div>
                   <p class="mt-2 text-xs text-mist">
                    Used for logging into Bilibili to get high resolution video and subtitles. Please get SessData from browser cookies.
                  </p>
               </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center p-6 border-t border-ink border-opacity-5 bg-white bg-opacity-50 backdrop-blur-md rounded-b-3xl">
          <button
            @click="resetSettings"
             :disabled="loading || saving"
            class="text-sm font-bold text-mist hover:text-coral transition-colors flex items-center"
          >
             <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Reset Defaults
          </button>
          
          <div class="flex space-x-4">
             <button
              @click="closeDialog"
              :disabled="saving"
              class="btn-ghost px-6 py-2.5 rounded-xl text-sm font-bold"
            >
              Cancel
            </button>
            <button
               @click="saveSettings"
              :disabled="loading || saving"
              class="btn-breathing px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-mint/20 flex items-center"
            >
              <span
                v-if="saving"
                class="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  loadConfig,
  saveConfig,
  loadUserHiddenCategories,
  saveUserHiddenCategories,
  type FrontendSettings,
  BACKEND,
} from '@/composables/ConfigAPI'
import { ElMessage } from 'element-plus'
import { useSubtitleStyle } from '@/composables/SubtitleStyle'
import {
  loadWhisperModels,
  downloadWhisperModel,
  getModelSize,
  type WhisperModel,
} from '@/composables/ConfigAPI'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  categories?: Array<{ id: number; name: string; items?: any[] }>
}>()

/** 2. declare the update event */
const emit = defineEmits<{
  /** called when we want to tell the parent to change `visible` */
  (e: 'update:visible', value: boolean): void
  /** called when hidden categories are updated */
  (e: 'categories-updated'): void
}>()

// 使用字幕样式composable
const { updateSubtitleSettings, updateForeignSubtitleSettings } = useSubtitleStyle()

// i18n functionality
const { t } = useI18n()

// 字幕类型选择
const subtitleType = ref<'raw' | 'foreign'>('raw')

// 背景样式代理属性
const backgroundStyleProxy = computed({
  get() {
    return subtitleType.value === 'raw' ? settings.backgroundStyle : settings.foreignBackgroundStyle
  },
  set(value: 'none' | 'solid' | 'semi-transparent') {
    if (subtitleType.value === 'raw') {
      settings.backgroundStyle = value
    } else {
      settings.foreignBackgroundStyle = value
    }
  },
})

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

// 当前模型提供商的API密钥和基础URL计算属性
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

// 当前字幕设置的计算属性
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
      textStroke: settings.textStroke,
      textStrokeColor: settings.textStrokeColor,
      textStrokeWidth: settings.textStrokeWidth,
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
      textStroke: settings.foreignTextStroke,
      textStrokeColor: settings.foreignTextStrokeColor,
      textStrokeWidth: settings.foreignTextStrokeWidth,
      backgroundStyle: settings.foreignBackgroundStyle,
      bottomDistance: settings.foreignBottomDistance,
    }
  }
})

// 更新当前字幕设置的方法
const updateCurrentSubtitleSettings = (key: string, value: any) => {
  if (subtitleType.value === 'raw') {
    ;(settings as any)[key] = value
  } else {
    ;(settings as any)[`foreign${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value
  }
}

// 生成预览用的组合文字阴影和描边效果
const getPreviewTextShadow = (
  textShadow: boolean,
  textStroke: boolean,
  strokeColor: string,
  strokeWidth: number,
) => {
  const effects = []

  // 添加描边效果
  if (textStroke) {
    for (let x = -strokeWidth; x <= strokeWidth; x++) {
      for (let y = -strokeWidth; y <= strokeWidth; y++) {
        if (x === 0 && y === 0) continue // 跳过中心点
        effects.push(`${x}px ${y}px 0 ${strokeColor}`)
      }
    }
  }

  // 添加阴影效果
  if (textShadow) {
    effects.push('2px 2px 4px rgba(0,0,0,0.5)')
  }

  return effects.length > 0 ? effects.join(', ') : 'none'
}
/** 3. a computed getter/setter that *maps* to the prop + emit */
const showSetting = computed<boolean>({
  get() {
    return props.visible
  },
  set(v: boolean) {
    emit('update:visible', v)
  },
})

const activeTab = ref('model')

const tabs = computed(() => [
  { id: 'model', label: t('llmSettings') },
  { id: 'interface', label: t('interfaceSettings') },
  { id: 'subtitle', label: t('subtitleSettings') },
  { id: 'transcription', label: t('transcriptionSettings') },
  { id: 'media', label: t('mediaCredentials') },
  { id: 'oss', label: 'OSS Service' },
  { id: 'tts', label: 'TTS 配音' },
])

const colorPresets = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00']

const fontWeights = [
  { label: '细体', value: '300' },
  { label: '正常', value: '400' },
  { label: '中等', value: '500' },
  { label: '半粗', value: '600' },
  { label: '粗体', value: '700' },
  { label: '特粗', value: '800' },
]

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const providerOptions = [
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'GLM', value: 'glm' },
  { label: 'Qwen', value: 'qwen' },
]

const allTranscriptionEngines = [
  { label: 'Whisper.cpp (本地C++实现, CPU/GPU)', value: 'whisper_cpp' },
  { label: 'ElevenLabs Speech-to-Text', value: 'elevenlabs' },
  { label: '阿里巴巴 DashScope', value: 'alibaba' },
  { label: 'OpenAI Whisper API', value: 'openai_whisper' },
  { label: '远程VidGo字幕服务', value: 'remote_vidgo' },
]

const settings = reactive<FrontendSettings>({
  // Model settings
  selectedModelProvider: 'deepseek',
  enableThinking: true,
  useProxy: false,
  // Provider-specific API keys
  deepseekApiKey: 'sk-17047f89de904759a241f4086bd5a9bf',
  deepseekBaseUrl: 'https://api.deepseek.com',
  deepseekModelName: '',
  openaiApiKey: 'sk-qTbd1AR4oMuP71ziRngmk3i0djrWVfLtuisvYKCH5B9jLz9g',
  openaiBaseUrl: 'https://api.chatanywhere.tech/v1',
  openaiModelName: '',
  glmApiKey: 'sk-17047f89de904759a241f4086bd5a9bf',
  glmBaseUrl: 'https://api.deepseek.com',
  glmModelName: '',
  qwenApiKey: 'sk-944471ea4aef486ca2a82b2adf26c0cc',
  qwenBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  qwenModelName: '',
  // Interface settings
  rawLanguage: 'zh',
  hiddenCategories: [],
  // Raw Subtitle settings
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
  // Foreign Subtitle settings
  foreignFontFamily: 'Arial',
  foreignPreviewText: 'This is translated subtitle preview',
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
  // Media credentials
  bilibiliSessData: '',
  // OSS Settings
  ossAccessKeyId: '',
  ossAccessKeySecret: '',
  ossEndpoint: '',
  ossBucket: '',
  ossRegion: '',
  // TTS Settings
  dashscopeApiKey: '',
  // Transcription Engine settings
  transcriptionPrimaryEngine: 'whisper_cpp',
  fwsrModel: 'large-v3',
  useGpu: true,  // GPU acceleration
  transcriptionElevenlabsApiKey: '',
  transcriptionElevenlabsModel: 'scribe_v1',
  transcriptionIncludePunctuation: true,
  transcriptionAlibabaApiKey: '',
  transcriptionAlibabaModel: 'paraformer-realtime-v2',
  transcriptionAlibabaCustomModel: '',
  transcriptionOpenaiApiKey: '',
  transcriptionOpenaiBaseUrl: 'https://api.openai.com/v1',
  transcriptionOpenaiModel: 'whisper-1',
  // Remote VidGo Service settings
  remoteVidGoHost: '',
  remoteVidGoPort: '9000',
  remoteVidGoUseSsl: false,
})

const loading = ref(false)
const saving = ref(false)
const availableModels = ref<WhisperModel[]>([])
const downloadProgress = ref(0)
const isDownloading = ref(false)
const isCheckingSize = ref(false)
const modelSizeInfo = ref('')
const showPreview = ref(false)
const previewAspectRatio = ref<'16:9' | '3:4'>('16:9')

// Computed properties for showing API key fields based on selected engine
const needsElevenlabsConfig = computed(() => {
  return settings.transcriptionPrimaryEngine === 'elevenlabs'
})

const needsAlibabaConfig = computed(() => {
  return settings.transcriptionPrimaryEngine === 'alibaba'
})

const needsOpenaiConfig = computed(() => {
  return settings.transcriptionPrimaryEngine === 'openai_whisper'
})

const needsRemoteVidGoConfig = computed(() => {
  return settings.transcriptionPrimaryEngine === 'remote_vidgo'
})

// Model management computed properties
const isCurrentModelDownloaded = computed(() => {
  const currentModel = availableModels.value.find((model) => model.name === settings.fwsrModel)
  return currentModel?.downloaded || false
})

const closeDialog = () => {
  showSetting.value = false
}

// Model management functions
const loadAvailableModels = async () => {
  try {
    const modelData = await loadWhisperModels()
    availableModels.value = modelData.models
  } catch (error) {
    console.error('Failed to load Whisper models:', error)
    ElMessage.error('加载模型列表失败')
  }
}

const checkModelSize = async (modelName: string) => {
  try {
    isCheckingSize.value = true
    const sizeData = await getModelSize(modelName)

    if (sizeData.exists) {
      ElMessage.success(
        `模型 ${modelName} 当前大小: ${sizeData.size_human} (${sizeData.file_count} 个文件)`,
      )
      modelSizeInfo.value = `${sizeData.size_human} (${sizeData.file_count} files)`
    } else {
      ElMessage.info(`模型 ${modelName} 文件夹不存在`)
      modelSizeInfo.value = '不存在'
    }
  } catch (error) {
    console.error('Failed to check model size:', error)
    ElMessage.error(`检查模型大小失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    isCheckingSize.value = false
  }
}

const downloadModel = async (modelName: string) => {
  try {
    isDownloading.value = true
    downloadProgress.value = 0

    await downloadWhisperModel(modelName, settings.transcriptionPrimaryEngine)
    ElMessage.success(`开始下载模型 ${modelName}`)

    // Simple polling without progress estimation
    const pollInterval = setInterval(async () => {
      try {
        const modelData = await loadWhisperModels()
        const model = modelData.models.find((m) => m.name === modelName)

        if (model?.downloaded) {
          clearInterval(pollInterval)
          isDownloading.value = false
          await loadAvailableModels() // Refresh the list
          ElMessage.success(`模型 ${modelName} 下载完成`)
        }
      } catch (error) {
        console.error('Error polling download status:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Set a timeout to stop polling after 30 minutes
    setTimeout(
      () => {
        clearInterval(pollInterval)
        isDownloading.value = false
      },
      30 * 60 * 1000,
    )
  } catch (error) {
    console.error('Failed to download model:', error)
    ElMessage.error(`下载模型失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    isDownloading.value = false
  }
}

const showPreviewModal = (aspectRatio: '16:9' | '3:4') => {
  previewAspectRatio.value = aspectRatio
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}

const loadSettings = async () => {
  try {
    loading.value = true

    // Load config settings and user hidden categories in parallel
    const [configData, userHiddenCategories] = await Promise.all([
      loadConfig(),
      loadUserHiddenCategories(),
    ])

    // Assign config data
    Object.assign(settings, configData)

    // Update hidden categories with user-defined ones
    settings.hiddenCategories = userHiddenCategories.usr_def_hidden_categories

    // Sync rawLanguage with localStorage lang setting
    const storedLang = localStorage.getItem('lang')
    if (storedLang && storedLang !== settings.rawLanguage) {
      settings.rawLanguage = storedLang
    }

    console.log('Loaded user hidden categories:', userHiddenCategories)
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载设置失败，请重试')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    saving.value = true

    // Save config settings and user hidden categories in parallel
    await Promise.all([saveConfig(settings), saveUserHiddenCategories(settings.hiddenCategories)])

    console.log('Settings saved successfully')
    ElMessage.success('设置已保存')

    // 同步原文字幕样式到全局状态
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

    // 同步外文字幕样式到全局状态
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

    emit('categories-updated') // 通知父组件更新分类过滤
    closeDialog()

    // Persist UI language and reload to apply new locale
    localStorage.setItem('lang', settings.rawLanguage)
    window.location.reload()
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存设置失败，请重试')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  Object.assign(settings, {
    // Model settings
    selectedModelProvider: 'deepseek',
    enableThinking: true,
    useProxy: false,
    // Provider-specific API keys
    deepseekApiKey: '',
    deepseekBaseUrl: 'https://api.deepseek.com',
    openaiApiKey: '',
    openaiBaseUrl: 'https://api.chatanywhere.tech/v1',
    glmApiKey: '',
    glmBaseUrl: 'https://api.deepseek.com',
    qwenApiKey: '',
    qwenBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    // Interface settings
    rawLanguage: 'zh',
    hiddenCategories: [],
    // Raw Subtitle settings
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
    backgroundStyle: 'semi-transparent' as 'none' | 'solid' | 'semi-transparent',
    bottomDistance: 80,
    // Foreign Subtitle settings
    foreignFontFamily: 'Arial',
    foreignPreviewText: 'This is foreign subtitle preview',
    foreignFontColor: '#ffffff',
    foreignFontSize: 16,
    foreignFontWeight: '400',
    foreignBackgroundColor: '#000000',
    foreignBorderRadius: 4,
    foreignTextShadow: false,
    foreignTextStroke: false,
    foreignTextStrokeColor: '#000000',
    foreignTextStrokeWidth: 2,
    foreignBackgroundStyle: 'semi-transparent' as 'none' | 'solid' | 'semi-transparent',
    foreignBottomDistance: 120,
    // Media credentials
    bilibiliSessData: '',
    // Transcription Engine settings
    transcriptionPrimaryEngine: 'whisper_cpp',
    fwsrModel: 'large-v3',
    useGpu: true,  // GPU acceleration
    transcriptionElevenlabsApiKey: '',
    transcriptionElevenlabsModel: 'scribe_v1',
    transcriptionIncludePunctuation: true,
    transcriptionAlibabaApiKey: '',
    transcriptionAlibabaModel: 'paraformer-realtime-v2',
    transcriptionOpenaiApiKey: '',
    transcriptionOpenaiBaseUrl: 'https://api.openai.com/v1',
    // Remote VidGo Service settings
    remoteVidGoHost: '',
    remoteVidGoPort: '9000',
    remoteVidGoUseSsl: false,
  })
}

// Test LLM connection by sending a simple prompt
const connectionTesting = ref(false)
const testLLMConnection = async () => {
  connectionTesting.value = true
  try {
    // 先保存当前设置，确保后端能读取到最新的配置
    await saveConfig(settings)
    ElMessage.success('设置已保存，开始测试连接...')
    
    // 稍等片刻让后端加载新配置
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
    if (navigator.clipboard && window.isSecureContext) {
      // Use Clipboard API if available and in secure context
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制到剪贴板')
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        ElMessage.success('已复制到剪贴板')
      } catch (err) {
        console.error('Fallback copy failed: ', err)
        ElMessage.error('复制失败')
      } finally {
        textArea.remove()
      }
    }
  } catch (err) {
    console.error('Failed to copy: ', err)
    ElMessage.error('复制失败')
  }
}

// Load settings when dialog opens
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      loadSettings()
    }
  },
)

// 监听原文字幕样式变化，实时更新
watch(
  [
    () => settings.fontFamily,
    () => settings.fontColor,
    () => settings.fontSize,
    () => settings.fontWeight,
    () => settings.backgroundStyle,
    () => settings.backgroundColor,
    () => settings.borderRadius,
    () => settings.textShadow,
    () => settings.textStroke,
    () => settings.textStrokeColor,
    () => settings.textStrokeWidth,
    () => settings.bottomDistance,
  ],
  () => {
    // 实时同步原文字幕样式到全局状态，提供实时预览
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
  },
  { deep: true, immediate: false },
)

// 监听外文字幕样式变化，实时更新
watch(
  [
    () => settings.foreignFontFamily,
    () => settings.foreignFontColor,
    () => settings.foreignFontSize,
    () => settings.foreignFontWeight,
    () => settings.foreignBackgroundStyle,
    () => settings.foreignBackgroundColor,
    () => settings.foreignBorderRadius,
    () => settings.foreignTextShadow,
    () => settings.foreignTextStroke,
    () => settings.foreignTextStrokeColor,
    () => settings.foreignTextStrokeWidth,
    () => settings.foreignBottomDistance,
  ],
  () => {
    // 实时同步外文字幕样式到全局状态，提供实时预览
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
  },
  { deep: true, immediate: false },
)

// Load settings on component mount
onMounted(() => {
  if (props.visible) {
    loadSettings()
    loadAvailableModels()
  }
})

// Watch for dialog visibility to load models
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      loadSettings()
      loadAvailableModels()
    }
  },
)

// Watch for changes in rawLanguage setting and sync with localStorage
watch(
  () => settings.rawLanguage,
  (newLang) => {
    // Update localStorage and i18n locale when rawLanguage changes
    localStorage.setItem('lang', newLang)
    // Note: We could also update the i18n locale here if needed
    // but the page reload in LangToggle.vue handles this currently
  },
  { immediate: false },
)
</script>

<style scoped>
/* Custom styles for better appearance */
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
