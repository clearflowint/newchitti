<template>
  <div id="clean-home-view" class="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
    <!-- Greetings Section (Clean, uncluttered, no default circle IDs) -->
    <div class="text-center space-y-2.5">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>ClearFlow Manager Workspace</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
        Hi, {{ manager?.Name || 'Manager' }} 👋
      </h1>

      <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ isNewCustomer 
          ? "Welcome to ClearFlow Automations! Let's get your chit fund setup started by creating your first group."
          : "Welcome to your workspace. Choose an option below to manage your chit funds."
        }}
      </p>
    </div>

    <!-- Core Actions Flow -->
    <div class="space-y-4">
      <!-- Option 1: Create New Chitti Group -->
      <router-link
        id="home-create-chitti-card"
        to="/onboarding"
        class="group block p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-600/25 via-blue-900/15 to-slate-900 border border-blue-500/35 hover:border-blue-400 shadow-lg hover:shadow-blue-500/10 transition-all text-left"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow">
                +
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                Create new chitti group
              </h2>
            </div>
            <p class="text-xs text-slate-300 pl-10 leading-relaxed">
              Configure custom members, monthly pool target, rule template, and foreman commission.
            </p>
          </div>
          <span class="text-blue-400 font-bold text-base shrink-0 group-hover:translate-x-1 transition-transform pt-1">
            &rarr;
          </span>
        </div>
      </router-link>

      <!-- Option 2: Select a Chitti from Side Bar for Existing Managers -->
      <div
        id="home-select-chitti-card"
        class="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-slate-200">
              Select a chitti from side bar for existing managers
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ hasActiveCircles ? 'Or pick an active circle directly below:' : 'Open the sidebar menu to view managed circles:' }}
            </p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Manager Personal Ledger Button (if manager has active circles) -->
            <button
              v-if="hasActiveCircles"
              type="button"
              @click="isManagerLedgerOpen = true"
              class="px-2.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 border border-purple-700/40 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              title="View Manager Personal Ledger"
            >
              <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Manager Ledger</span>
            </button>

            <!-- View All Groups Button -->
            <router-link
              v-if="hasActiveCircles"
              to="/groups"
              class="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              title="Manage all groups with delete options"
            >
              <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              <span>All Groups ({{ groups.length }})</span>
            </router-link>

            <!-- Open Sidebar Button -->
            <button
              type="button"
              @click="openSidebar"
              class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Open side bar to select chitti"
            >
              <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Sidebar</span>
            </button>
          </div>
        </div>

        <!-- If Existing Circles Exist: One-Click Circle Jump Cards -->
        <div v-if="hasActiveCircles" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div
            v-for="g in groups"
            :key="g.Chitti_ID"
            @click="navigateToGroup(g.Chitti_ID)"
            class="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs group"
          >
            <div class="min-w-0 pr-2 space-y-0.5">
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-blue-400 text-xs">
                  {{ g.Chitti_ID }}
                </span>
                <span class="text-[9px] text-slate-500 font-mono">
                  M{{ g.Current_Month || 1 }}/{{ g.Total_Months || 20 }}
                </span>
              </div>
              <p class="font-semibold text-slate-200 truncate">
                {{ g.Chitti_Name }}
              </p>
              <span class="text-[10px] text-slate-400 font-mono block">
                {{ g.Total_Members || g.Total_Shares || 20 }} Members &bull; ₹{{ (Number(g.Monthly_Commission) || 4000).toLocaleString('en-IN') }}/mo
              </span>
            </div>
            <span class="text-slate-500 group-hover:text-blue-400 text-xs font-bold transition-colors shrink-0">
              Open &rarr;
            </span>
          </div>
        </div>

        <!-- If New Customer with No Circles Yet: Friendly Empty Helper -->
        <div v-else class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
          <p class="text-xs text-slate-400 leading-relaxed">
            No circles configured yet. Once you create your first chitti group, it will appear here and in your sidebar router.
          </p>
          <router-link
            to="/onboarding"
            class="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            <span>Start Onboarding Wizard &rarr;</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Down side: Powered by ClearFlow Automations -->
    <div class="pt-8 text-center border-t border-slate-800/60 space-y-3">
      <div class="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <span>Powered by ClearFlow Automations</span>
      </div>

      <!-- Flow simulator for testing -->
      <div class="flex items-center justify-center gap-2 text-[10px] text-slate-600">
        <span>Workspace Mode:</span>
        <button
          type="button"
          @click="toggleCustomerFlow"
          class="text-slate-400 hover:text-slate-200 font-mono underline transition-colors"
        >
          {{ isNewCustomer ? 'New Customer (click to toggle)' : 'Existing Manager (click to toggle)' }}
        </button>
      </div>
    </div>

    <!-- Manager Personal Ledger Modal -->
    <ManagerPersonalLedgerModal
      :is-open="isManagerLedgerOpen"
      :ledger="managerLedgerData"
      @close="isManagerLedgerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';
import { useSidebar } from '../composables/useSidebar';
import { calculateManagerPersonalLedger } from '../composables/chitti_math_engine';
import ManagerPersonalLedgerModal from '../components/ManagerPersonalLedgerModal.vue';

const router = useRouter();
const { manager, groups, isNewCustomer, setCustomerType } = useManagerWorkspace();
const { openSidebar } = useSidebar();

const isManagerLedgerOpen = ref(false);

const hasActiveCircles = computed(() => {
  return !isNewCustomer.value && Array.isArray(groups.value) && groups.value.length > 0;
});

const activeCircleForLedger = computed(() => {
  return groups.value && groups.value.length > 0 ? groups.value[0] : null;
});

const managerLedgerData = computed(() => {
  if (!activeCircleForLedger.value) return null;
  return calculateManagerPersonalLedger({
    chitti: activeCircleForLedger.value,
    activeMonth: activeCircleForLedger.value.Current_Month || 1
  });
});

const navigateToGroup = (chittiId) => {
  router.push(`/groups/${chittiId}`);
};

const toggleCustomerFlow = () => {
  const nextType = isNewCustomer.value ? 'existing' : 'new';
  setCustomerType(nextType);
};
</script>
