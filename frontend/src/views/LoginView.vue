<template>
  <div id="login-view" class="min-h-[80vh] flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <!-- Logo & Brand Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-clearflow-blue text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-blue-500/20">
          CF
        </div>
        <h1 class="text-2xl font-bold text-slate-100">ClearFlow Chits</h1>
        <p class="text-xs text-slate-400">
          Small Chits Workflow Automation &bull; Manager Workspace
        </p>
      </div>

      <!-- Quick Enter as Chit Foreman -->
      <div class="space-y-4">
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
              FM
            </div>
            <div>
              <p class="font-bold text-slate-100 text-sm">
                {{ manager?.Name || 'Rajesh Sharma' }}
              </p>
              <p class="text-[11px] text-slate-400">
                Chit Foreman &bull; {{ groups.length }} Managed Groups
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="enterWorkspace"
            class="w-full py-2.5 bg-clearflow-blue hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
          >
            <span>Enter Manager Workspace</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>

        <router-link
          to="/demo"
          class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
        >
          <span>Open Interactive Sandbox Demo</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';

const router = useRouter();
const { manager, groups } = useManagerWorkspace();

const enterWorkspace = () => {
  router.push('/home');
};
</script>
