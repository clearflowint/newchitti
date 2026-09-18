<template>
  <div id="manager-home-view" class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <!-- Manager Header Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold text-xl flex items-center justify-center border border-indigo-500/30 shadow-inner">
            FM
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Chit Fund Foreman
              </span>
              <span
                v-if="isSampleWorkspace"
                class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                Sample Workspace Active
              </span>
            </div>
            <h1 class="text-2xl font-bold text-slate-100 mt-1">{{ manager?.Name || 'Rajesh Sharma' }}</h1>
            <p class="text-xs text-slate-400">ClearFlow Multi-Chitti Management Dashboard &bull; {{ groups.length }} Active Groups</p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <router-link
            to="/onboarding"
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>+ Create New Chitti</span>
          </router-link>

          <button
            type="button"
            @click="handleReset"
            class="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
            title="Reset to default sample groups"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Portfolio Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <span class="text-xs text-slate-400 block mb-1">Active Chitti Circles</span>
          <strong class="text-xl font-bold text-slate-100 font-mono">{{ groups.length }}</strong>
          <span class="text-[10px] text-slate-400 block mt-0.5">Isolated circles</span>
        </div>

        <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <span class="text-xs text-slate-400 block mb-1">Combined Monthly Target</span>
          <strong class="text-xl font-bold text-slate-100 font-mono">₹{{ totalMonthlyTarget.toLocaleString('en-IN') }}</strong>
          <span class="text-[10px] text-slate-400 block mt-0.5">Estimated gross collection</span>
        </div>

        <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <span class="text-xs text-slate-400 block mb-1">Foreman Monthly Income</span>
          <strong class="text-xl font-bold text-blue-400 font-mono">₹{{ totalCommission.toLocaleString('en-IN') }}</strong>
          <span class="text-[10px] text-slate-400 block mt-0.5">Fixed commission/mo</span>
        </div>

        <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <span class="text-xs text-slate-400 block mb-1">Total Managed Shares</span>
          <strong class="text-xl font-bold text-emerald-400 font-mono">{{ totalSharesCount }}</strong>
          <span class="text-[10px] text-slate-400 block mt-0.5">Across all active groups</span>
        </div>
      </div>
    </div>

    <!-- Sample Notice Banner if using sample data -->
    <div
      v-if="isSampleWorkspace"
      class="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-300"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>Sample workspace loaded. You can create custom circles or test operations with full persistence.</span>
      </div>
      <router-link to="/onboarding" class="underline font-bold text-amber-200 hover:text-white">
        Start Fresh Circle &rarr;
      </router-link>
    </div>

    <!-- Groups List -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-100">Your Managed Chitti Groups</h2>
          <p class="text-xs text-slate-400">Select any group to inspect share ledger, record payments, and view summary hub</p>
        </div>
        <span class="text-xs text-slate-500 font-mono">{{ groups.length }} groups configured</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="grp in groups"
          :key="grp.Chitti_ID"
          class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm space-y-4 flex flex-col justify-between group"
        >
          <div>
            <!-- Group Card Header -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  {{ grp.Chitti_ID }}
                </span>
                <h3 class="text-base font-bold text-slate-100 mt-1.5 group-hover:text-blue-400 transition-colors">
                  {{ grp.Chitti_Name }}
                </h3>
              </div>
              <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Month {{ grp.Current_Month || 1 }}/{{ grp.Total_Months || 20 }}
              </span>
            </div>

            <!-- Parameters Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Rule Template</span>
                <strong class="text-slate-200 font-mono text-xs truncate block">{{ grp.Rule_Template || 'Incremental' }}</strong>
              </div>

              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Drawn Due (Prized)</span>
                <strong class="text-emerald-400 font-mono text-xs">₹{{ (Number(grp.Drawn_Due) || 6000).toLocaleString('en-IN') }}</strong>
              </div>

              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Undrawn (Saver)</span>
                <strong class="text-blue-400 font-mono text-xs">₹{{ (Number(grp.Undrawn_Due) || 5000).toLocaleString('en-IN') }}</strong>
              </div>

              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Monthly Comm (C)</span>
                <strong class="text-slate-200 font-mono text-xs">₹{{ (Number(grp.Monthly_Commission) || 4000).toLocaleString('en-IN') }}</strong>
              </div>

              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Cycle Anchor</span>
                <strong class="text-indigo-400 font-mono text-xs">{{ grp.Cycle_Anchor_Day || '10th to 10th' }}</strong>
              </div>

              <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Total Shares</span>
                <strong class="text-slate-200 font-mono text-xs">{{ grp.Total_Members || grp.Total_Shares || 20 }} Shares</strong>
              </div>
            </div>
          </div>

          <!-- Open Group Ledger Link -->
          <div class="pt-2">
            <router-link
              :to="`/groups/${grp.Chitti_ID}`"
              class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <span>Manage Group &amp; Shares Ledger</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';

const { manager, groups, isSampleWorkspace, fetchWorkspace, resetToSample } = useManagerWorkspace();

onMounted(() => {
  fetchWorkspace();
});

const totalMonthlyTarget = computed(() => {
  return groups.value.reduce((acc, g) => {
    const s = Number(g.Total_Members || g.Total_Shares || 20);
    const u = Number(g.Undrawn_Due || 5000);
    return acc + (s * u);
  }, 0);
});

const totalCommission = computed(() => {
  return groups.value.reduce((acc, g) => acc + (Number(g.Monthly_Commission) || 0), 0);
});

const totalSharesCount = computed(() => {
  return groups.value.reduce((acc, g) => acc + (Number(g.Total_Members || g.Total_Shares || 20)), 0);
});

const handleReset = () => {
  if (confirm('Reset workspace groups to default sample data?')) {
    resetToSample();
  }
};
</script>
