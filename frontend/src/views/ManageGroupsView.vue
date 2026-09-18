<template>
  <div id="manage-groups-view" class="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
    <!-- Success / Info Toast -->
    <div
      v-if="toastMessage"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in"
    >
      <svg class="w-4 h-4 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Header & Navigation -->
    <div class="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Manager Workspace</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {{ groups.length }} Total Circles
          </span>
        </div>
        <h1 class="text-2xl font-bold text-slate-100 mt-1">All Chitti Groups</h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Review, open, and manage all chit fund circles created under your foreman account.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/onboarding"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Create New Chitti</span>
        </router-link>
        <router-link
          to="/home"
          class="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          &larr; Back to Home
        </router-link>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div v-if="groups.length > 0" class="flex items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by group name or ID..."
          class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
        />
        <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <span class="text-xs text-slate-500 font-mono">
        Showing {{ filteredGroups.length }} of {{ groups.length }}
      </span>
    </div>

    <!-- Empty State -->
    <div
      v-if="groups.length === 0"
      class="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-200">No Chitti Groups Found</h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          You currently have no active circles. Use the universal onboarding wizard to launch your first chit fund circle.
        </p>
      </div>
      <router-link
        to="/onboarding"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
      >
        <span>+ Launch First Chitti Group</span>
      </router-link>
    </div>

    <!-- Groups Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="g in filteredGroups"
        :key="g.Chitti_ID"
        class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm"
      >
        <!-- Card Header -->
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {{ g.Chitti_ID }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">
                  Month {{ g.Current_Month || 1 }} of {{ g.Total_Months || 20 }}
                </span>
              </div>
              <h2 class="text-base font-bold text-slate-100 mt-1 truncate">
                {{ g.Chitti_Name }}
              </h2>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              Active
            </span>
          </div>

          <!-- Parameters Summary Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-[10px] text-slate-400 font-sans block">Total Shares / Members</span>
              <strong class="text-slate-200 text-xs">
                {{ g.Total_Members || g.Total_Shares || 20 }} Members
              </strong>
            </div>
            <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-[10px] text-slate-400 font-sans block">Foreman Fee</span>
              <strong class="text-purple-300 text-xs">
                ₹{{ (Number(g.Monthly_Commission) || 0).toLocaleString('en-IN') }}/mo
              </strong>
            </div>
            <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-[10px] text-slate-400 font-sans block">Undrawn Installment</span>
              <strong class="text-blue-300 text-xs">
                ₹{{ (Number(g.Undrawn_Due) || 5000).toLocaleString('en-IN') }}
              </strong>
            </div>
            <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-[10px] text-slate-400 font-sans block">Drawn Installment</span>
              <strong class="text-emerald-300 text-xs">
                ₹{{ (Number(g.Drawn_Due) || 6000).toLocaleString('en-IN') }}
              </strong>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Cycle Anchor: <strong class="text-slate-300">{{ g.Cycle_Anchor_Day || '1st to 1st' }}</strong></span>
            <span class="font-mono text-slate-500">{{ g.Rule_Template || 'Incremental Model V1' }}</span>
          </div>
        </div>

        <!-- Card Footer Actions: Open Group & Three-Click Protected Delete -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <!-- 3-Click Delete Trigger -->
          <button
            type="button"
            @click="initiateThreeClickDelete(g)"
            class="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 hover:border-rose-700/50 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Safely delete this chitti group (requires 3-click confirmation)"
          >
            <svg class="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>Delete Chitti</span>
          </button>

          <!-- Open Group Router Link -->
          <router-link
            :to="`/groups/${g.Chitti_ID}`"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Open Ledger</span>
            <span class="text-sm font-normal">&rarr;</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- THREE-CLICK SEQUENTIAL SAFETY MODAL -->
    <div
      v-if="deleteModalOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      @click.self="cancelDelete"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5">
        <!-- Modal Top Progress Indicator (Step 1, Step 2, Step 3) -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="deleteStep === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : (deleteStep > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500')"
            >
              1
            </span>
            <span class="w-4 h-0.5 bg-slate-700"></span>
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="deleteStep === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : (deleteStep > 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500')"
            >
              2
            </span>
            <span class="w-4 h-0.5 bg-slate-700"></span>
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="deleteStep === 3 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-500'"
            >
              3
            </span>
          </div>
          <span class="text-[11px] font-mono text-slate-400 uppercase font-bold">
            3-Click Deletion Safety
          </span>
        </div>

        <!-- STEP 1: Initiation -->
        <div v-if="deleteStep === 1" class="space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>

          <div class="text-center space-y-1">
            <h3 class="text-base font-bold text-slate-100">
              Step 1 of 3: Initiate Deletion
            </h3>
            <p class="text-xs text-slate-400">
              You are requesting to delete <strong class="text-slate-200">{{ targetGroup?.Chitti_Name }}</strong> (<span class="font-mono text-blue-400">{{ targetGroup?.Chitti_ID }}</span>).
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1.5">
            <span class="font-semibold text-slate-300 block">Why 3-click verification?</span>
            <p>
              To prevent accidental deletion while multitasking, ClearFlow enforces three distinct user confirmations before erasing circle ledgers.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              @click="cancelDelete"
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel &amp; Keep Group
            </button>
            <!-- CLICK 1 -> ADVANCE TO STEP 2 -->
            <button
              type="button"
              @click="proceedToStepTwo"
              class="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow"
            >
              <span>[Click 1] Continue &rarr;</span>
            </button>
          </div>
        </div>

        <!-- STEP 2: Consequence Acknowledgement -->
        <div v-else-if="deleteStep === 2" class="space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div class="text-center space-y-1">
            <h3 class="text-base font-bold text-slate-100">
              Step 2 of 3: Verify Consequences
            </h3>
            <p class="text-xs text-slate-400">
              Confirm that you understand the permanent removal of all records for {{ targetGroup?.Chitti_ID }}.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 space-y-2">
            <span class="font-bold flex items-center gap-1.5 text-rose-200">
              <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Irreversible Action</span>
            </span>
            <p class="text-[11px] leading-relaxed">
              All member rosters ({{ targetGroup?.Total_Members || 20 }} shares), past monthly installments, manager commissions, and payout transaction ledgers will be wiped out.
            </p>
          </div>

          <label class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-950/80 transition-colors">
            <input
              v-model="hasAcknowledgedConsequences"
              type="checkbox"
              class="mt-0.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0 focus:outline-none"
            />
            <span class="text-xs text-slate-300 select-none">
              I acknowledge that I am deliberately deleting <strong class="text-slate-100">{{ targetGroup?.Chitti_Name }}</strong> and this cannot be undone.
            </span>
          </label>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              @click="cancelDelete"
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <!-- CLICK 2 -> ADVANCE TO STEP 3 -->
            <button
              type="button"
              @click="proceedToStepThree"
              :disabled="!hasAcknowledgedConsequences"
              class="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow"
            >
              <span>[Click 2] Unlock Final Step &rarr;</span>
            </button>
          </div>
        </div>

        <!-- STEP 3: Final Execution Confirmation -->
        <div v-else-if="deleteStep === 3" class="space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 mx-auto animate-pulse">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>

          <div class="text-center space-y-1">
            <h3 class="text-base font-bold text-rose-300">
              Step 3 of 3: Final Execution
            </h3>
            <p class="text-xs text-slate-400">
              Confirming final deletion for <span class="font-mono font-bold text-slate-100">{{ targetGroup?.Chitti_ID }}</span>.
            </p>
          </div>

          <p class="text-xs text-center text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
            Click the red button below to execute deletion now.
          </p>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              @click="cancelDelete"
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <!-- CLICK 3 -> EXECUTES DELETE -->
            <button
              type="button"
              @click="executeFinalDelete"
              class="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-rose-900/30"
            >
              <span>[Click 3] Delete Group Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';

const { groups, deleteGroup } = useManagerWorkspace();

const searchQuery = ref('');
const toastMessage = ref('');
let toastTimeout = null;

const showToast = (msg) => {
  toastMessage.value = msg;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.value = '';
  }, 2500);
};

// Filtered groups by search
const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return groups.value;
  return groups.value.filter((g) => {
    return (
      (g.Chitti_Name || '').toLowerCase().includes(q) ||
      (g.Chitti_ID || '').toLowerCase().includes(q)
    );
  });
});

// Three-Click Delete Safety State
const deleteModalOpen = ref(false);
const deleteStep = ref(1); // 1, 2, 3
const targetGroup = ref(null);
const hasAcknowledgedConsequences = ref(false);

// Step 1: Triggered from "Delete Chitti" button on group card
const initiateThreeClickDelete = (group) => {
  targetGroup.value = group;
  deleteStep.value = 1;
  hasAcknowledgedConsequences.value = false;
  deleteModalOpen.value = true;
};

// Click 1 action: Advances to Step 2
const proceedToStepTwo = () => {
  deleteStep.value = 2;
};

// Click 2 action: Advances to Step 3
const proceedToStepThree = () => {
  if (!hasAcknowledgedConsequences.value) return;
  deleteStep.value = 3;
};

// Click 3 action: Executes permanent deletion
const executeFinalDelete = () => {
  if (!targetGroup.value) return;
  const deletedId = targetGroup.value.Chitti_ID;
  const deletedName = targetGroup.value.Chitti_Name;

  deleteGroup(deletedId);
  deleteModalOpen.value = false;
  deleteStep.value = 1;
  targetGroup.value = null;
  hasAcknowledgedConsequences.value = false;

  showToast(`Successfully deleted ${deletedName} (${deletedId})`);
};

// Cancel & abort deletion at any step
const cancelDelete = () => {
  deleteModalOpen.value = false;
  deleteStep.value = 1;
  targetGroup.value = null;
  hasAcknowledgedConsequences.value = false;
};
</script>
