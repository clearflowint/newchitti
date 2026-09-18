<template>
  <div class="min-h-screen bg-clearflow-slate text-slate-100 flex flex-col font-sans selection:bg-clearflow-blue selection:text-white">
    <!-- Top Mobile-Focused Header with Sidebar Toggle -->
    <header class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div class="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between gap-2">
        <!-- Left: Hamburger Button & Active Chitti ID Badge -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="isSidebarOpen = true"
            class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open Chitti Router Sidebar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Brand & Active Chitti -->
          <div class="flex items-center gap-1.5 cursor-pointer" @click="isSidebarOpen = true">
            <span class="font-bold text-slate-100 text-sm tracking-tight hidden xs:inline">
              ClearFlow <span class="text-blue-400">Chits</span>
            </span>
            <span class="text-slate-600 hidden xs:inline">&bull;</span>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {{ activeChittiId }}
            </span>
          </div>
        </div>

        <!-- Right: ClearFlow Automations in very small letters -->
        <div class="flex items-center">
          <span class="text-[11px] text-slate-400 font-normal tracking-tight">
            ClearFlow Automations
          </span>
        </div>
      </div>
    </header>

    <!-- Sidebar Router Drawer (The Chitti Router for Manager) -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
      @click="isSidebarOpen = false"
    >
      <aside
        class="fixed top-0 bottom-0 left-0 w-72 sm:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200"
        @click.stop
      >
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
              CF
            </div>
            <div>
              <h2 class="font-bold text-slate-100 text-sm leading-tight">Chitti Groups</h2>
              <p class="text-[10px] text-slate-400">Select Circle</p>
            </div>
          </div>

          <button
            type="button"
            @click="isSidebarOpen = false"
            class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <!-- Chitti Groups Router List -->
        <div class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div class="flex items-center justify-between px-1 mb-1">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Managed Chitti IDs</span>
            <span class="text-[10px] font-mono text-slate-500">{{ groups.length }} Circles</span>
          </div>

          <!-- Group Router Cards -->
          <div
            v-for="group in groups"
            :key="group.Chitti_ID"
            @click="selectGroup(group.Chitti_ID)"
            class="p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5"
            :class="activeChittiId === group.Chitti_ID
              ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
              : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono font-bold text-xs" :class="activeChittiId === group.Chitti_ID ? 'text-blue-400' : 'text-slate-300'">
                {{ group.Chitti_ID }}
              </span>
              <span
                v-if="activeChittiId === group.Chitti_ID"
                class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono"
              >
                Current Active
              </span>
              <span v-else class="text-[9px] font-mono text-slate-500">
                Tap to load &rarr;
              </span>
            </div>

            <h4 class="font-bold text-slate-200 text-xs truncate">
              {{ group.Chitti_Name }}
            </h4>

            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
              <span>Month {{ group.Current_Month || 1 }}/{{ group.Total_Months || 20 }}</span>
              <span>₹{{ (Number(group.Monthly_Commission) || 4000).toLocaleString('en-IN') }}/mo</span>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & Navigation -->
        <div class="p-3 border-t border-slate-800 bg-slate-900/40 space-y-2 text-xs">
          <router-link
            to="/onboarding"
            @click="isSidebarOpen = false"
            class="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>+ Create New Chitti</span>
          </router-link>

          <router-link
            to="/demo"
            @click="isSidebarOpen = false"
            class="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Sandbox Playground</span>
          </router-link>

          <button
            type="button"
            @click="handleResetDemo"
            class="w-full py-1.5 text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset Demo Data
          </button>
        </div>
      </aside>
    </div>

    <!-- Main View: Single Page ShareID Card Focused -->
    <main class="flex-1 pb-10">
      <router-view />
    </main>

    <!-- Global Minimal Footer -->
    <footer class="border-t border-slate-800 bg-slate-950 py-4 text-center text-[11px] text-slate-500">
      <div class="max-w-2xl mx-auto px-4 flex items-center justify-between gap-2 font-mono">
        <span>ClearFlow Mobile Chits</span>
        <span>Dynamic P(m) &amp; W(m) Engine</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useManagerWorkspace } from './composables/useManagerWorkspace';

const route = useRoute();
const router = useRouter();
const { groups, resetToSample } = useManagerWorkspace();

const isSidebarOpen = ref(false);

const activeChittiId = computed(() => {
  return route.params.chittiId || groups.value[0]?.Chitti_ID || 'CHT-2026-A';
});

const selectGroup = (chittiId) => {
  isSidebarOpen.value = false;
  router.push(`/groups/${chittiId}`);
};

const handleResetDemo = () => {
  if (confirm('Reset workspace groups and ledger records to initial sample state?')) {
    resetToSample();
    window.location.reload();
  }
};
</script>
