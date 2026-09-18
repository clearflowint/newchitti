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

      <!-- Quick Enter as Chit Foreman & Google Sign In -->
      <div class="space-y-4">
        <!-- Sign in with Google (Default for managers) -->
        <div class="space-y-2">
          <button
            id="google-signin-btn"
            type="button"
            @click="signInWithGoogle('existing')"
            class="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2.5 border border-slate-200 cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <!-- Quick Flow Picker for Testing Google Login Flows -->
          <div class="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
            <span>Or test as:</span>
            <button
              type="button"
              @click="signInWithGoogle('new')"
              class="text-amber-400 hover:underline font-semibold"
            >
              New Customer Flow
            </button>
            <span>&bull;</span>
            <button
              type="button"
              @click="signInWithGoogle('existing')"
              class="text-blue-400 hover:underline font-semibold"
            >
              Existing Customer Flow
            </button>
          </div>
        </div>

        <div class="relative flex items-center justify-center my-2">
          <div class="border-t border-slate-800 w-full"></div>
          <span class="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase font-mono">or quick manager enter</span>
          <div class="border-t border-slate-800 w-full"></div>
        </div>

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
import { generateUnique6DigitId } from '../utils/idGenerator';

const router = useRouter();
const { manager, groups, setCustomerType } = useManagerWorkspace();

const enterWorkspace = () => {
  setCustomerType('existing');
  router.push('/');
};

const signInWithGoogle = (type = 'existing') => {
  localStorage.setItem('clearflow_auth_token', 'google_oauth_token_' + Date.now());
  setCustomerType(type);
  if (type === 'new') {
    manager.value = {
      Manager_ID: generateUnique6DigitId(),
      Name: 'New Chit Operator',
      Email: 'new.operator@clearflow.app',
      Role: 'Foreman'
    };
  }
  router.push('/');
};
</script>
