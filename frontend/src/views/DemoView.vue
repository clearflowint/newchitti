<template>
  <div id="demo-view" class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div class="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-clearflow-blue uppercase tracking-wider">
            Interactive Test Sandbox
          </span>
          <h1 class="text-2xl font-bold text-slate-100 mt-1">ClearFlow Demo Environment</h1>
          <p class="text-xs text-slate-400 mt-0.5">
            Test Chit Fund cycles, simulate share payment recording, and toggle Draw status with live calculations.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <router-link
            to="/home"
            class="px-4 py-2 bg-clearflow-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow"
          >
            Go to Manager Workspace &rarr;
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Group Switcher for Demo -->
    <div class="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
      <span class="text-xs text-slate-400 px-2 font-medium">Select Group:</span>
      <button
        v-for="grp in groups"
        :key="grp.Chitti_ID"
        @click="selectedChittiId = grp.Chitti_ID"
        :class="selectedChittiId === grp.Chitti_ID ? 'bg-clearflow-blue text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
        class="px-3 py-1.5 rounded-lg text-xs transition-colors"
      >
        {{ grp.Chitti_Name }}
      </button>
    </div>

    <!-- Embed Group Details directly for testing -->
    <div v-if="activeGroup" class="space-y-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span class="font-bold text-slate-200 text-sm block">{{ activeGroup.Chitti_Name }}</span>
          <span class="text-slate-400">
            Pool: ₹{{ activeGroup.Chit_Value.toLocaleString('en-IN') }} &bull;
            Drawn Due: ₹{{ activeGroup.Drawn_Due.toLocaleString('en-IN') }} &bull;
            Undrawn Due: ₹{{ activeGroup.Undrawn_Due.toLocaleString('en-IN') }}
          </span>
        </div>

        <router-link
          :to="`/groups/${activeGroup.Chitti_ID}`"
          class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors"
        >
          Open in Full View &rarr;
        </router-link>
      </div>

      <!-- Demonstration of Share Cards with demoMode true -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShareCard
          v-for="share in demoShares.slice(0, 6)"
          :key="share.Share_ID"
          :share="share"
          :transaction="getDemoTransaction(share.Share_ID)"
          :chitti="activeGroup"
          :demo-mode="true"
          @paid="handleDemoPayment"
          @draw-updated="handleDemoDrawToggle"
          @statement="openStatement"
        />
      </div>
      <p class="text-center text-xs text-slate-500 italic">
        Showing first 6 sample shares in sandbox mode. Open full view to inspect all 20 shares.
      </p>
    </div>

    <!-- Statement Modal in Demo -->
    <StatementModal
      :is-open="isStatementOpen"
      :share="selectedShare"
      :statement="shareStatement"
      :current-month="activeGroup?.Current_Month || 1"
      @close="isStatementOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';
import { useApi } from '../composables/useApi';
import ShareCard from '../components/ShareCard.vue';
import StatementModal from '../components/StatementModal.vue';

const { groups, getGroupById } = useManagerWorkspace();
const {
  activeChitti,
  shares,
  transactions,
  loadGroupDetails,
  recordPayment,
  toggleDrawStatus,
  getShareStatement
} = useApi();

const selectedChittiId = ref(groups.value[0]?.Chitti_ID || 'CHT-2026-A');
const activeGroup = computed(() => getGroupById(selectedChittiId.value) || groups.value[0]);

const isStatementOpen = ref(false);
const selectedShare = ref(null);
const shareStatement = ref([]);

const demoShares = computed(() => shares.value);

const loadCurrent = () => {
  if (activeGroup.value) {
    loadGroupDetails(activeGroup.value, activeGroup.value.Current_Month || 1);
  }
};

onMounted(() => {
  loadCurrent();
});

watch(selectedChittiId, () => {
  loadCurrent();
});

const getDemoTransaction = (shareId) => {
  return transactions.value.find((t) => t.Share_ID === shareId) || null;
};

const handleDemoPayment = (payload) => {
  recordPayment(payload);
};

const handleDemoDrawToggle = (shareId) => {
  toggleDrawStatus(shareId);
};

const openStatement = (shareId) => {
  const s = shares.value.find((sh) => sh.Share_ID === shareId);
  if (s) {
    selectedShare.value = s;
    shareStatement.value = getShareStatement(shareId);
    isStatementOpen.value = true;
  }
};
</script>
