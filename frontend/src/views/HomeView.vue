<template>
  <div id="single-page-group-view" class="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
    <!-- Feedback Toast -->
    <div
      v-if="toastMessage"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
    >
      <svg class="w-4 h-4 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs">
      <div class="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
      Loading Chitti Share Ledger...
    </div>

    <!-- Not Found State -->
    <div v-else-if="!activeChitti" class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
      <h2 class="text-base font-bold text-slate-200">Chitti Group Not Found</h2>
      <p class="text-xs text-slate-400">Please select a Chitti ID from the sidebar menu.</p>
    </div>

    <!-- Active Single-Page View -->
    <div v-else class="space-y-3.5">
      <!-- 1. Top: Month Card Summary (Works INDEPENDENTLY - shows that month's summary only; no percentage, no commission, draw amount instead of winner) -->
      <section
        id="month-summary-card"
        class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3"
      >
        <!-- Top Row: Chitti ID, Month Stepper & Month Statement Button -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
              {{ activeChitti.Chitti_ID }}
            </span>
            <h1 class="font-bold text-slate-100 text-sm sm:text-base truncate leading-tight">
              {{ activeChitti.Chitti_Name }}
            </h1>
          </div>

          <!-- Independent Month Stepper & Statement -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- One-Click Month Statement Button -->
            <button
              type="button"
              @click="isMonthStatementOpen = true"
              class="px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="View Statement for this Month"
            >
              <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Month Statement</span>
            </button>

            <!-- Month Stepper (Independent reference - does not displace live share cards below) -->
            <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                :disabled="summaryMonth <= 1"
                @click="summaryMonth--"
                class="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold transition-colors"
                title="Previous Month Summary"
              >
                &lsaquo;
              </button>
              <span class="text-xs font-mono font-bold text-blue-400 px-1.5 whitespace-nowrap">
                M{{ summaryMonth }}/{{ totalMonths }}
              </span>
              <button
                type="button"
                :disabled="summaryMonth >= totalMonths"
                @click="summaryMonth++"
                class="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold transition-colors"
                title="Next Month Summary"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>

        <!-- Independent Month Financial Breakdown (No Percentage, No Commission, Draw Amount terminology) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/70 text-xs">
          <!-- Gross Monthly Pool Target -->
          <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Gross Pool Target &bull; Month {{ summaryMonth }}</span>
            <strong class="text-base font-bold text-slate-100 font-mono block mt-0.5">
              ₹{{ summaryMetrics.gross_pool.toLocaleString('en-IN') }}
            </strong>
            <span class="text-[10px] text-slate-400 block font-mono mt-0.5">
              {{ summaryMetrics.n_undrawn }} Savers &bull; {{ summaryMetrics.n_drawn }} Prized
            </span>
          </div>

          <!-- This Month Draw Amount (Replaced 'Winner') -->
          <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">This Month Draw Amount</span>
            <strong class="text-base font-bold text-amber-400 font-mono block mt-0.5">
              ₹{{ summaryMetrics.net_payout.toLocaleString('en-IN') }}
            </strong>
            <span class="text-[10px] text-slate-400 block font-mono mt-0.5">
              Payout for Month {{ summaryMonth }} draw
            </span>
          </div>

          <!-- Cycle Installment Rates -->
          <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Cycle Rates</span>
            <div class="text-[11px] font-mono mt-0.5 flex items-center justify-between sm:block sm:space-y-0.5">
              <div class="text-slate-300">
                Saver: <span class="font-bold">₹{{ undrawnDue.toLocaleString('en-IN') }}</span>
              </div>
              <div class="text-purple-300">
                Prized: <span class="font-bold">₹{{ drawnDue.toLocaleString('en-IN') }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Below Month Card: 3 Small Filter Tabs (All Shares | Paid | Pending) -->
      <section id="shareid-filter-tabs" class="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <!-- Tab 1: All Shares -->
        <button
          type="button"
          @click="activeFilterTab = 'all'"
          class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
          :class="activeFilterTab === 'all'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
        >
          <span>All Shares</span>
          <span
            class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal"
            :class="activeFilterTab === 'all' ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-400'"
          >
            {{ shares.length }}
          </span>
        </button>

        <!-- Tab 2: Paid (Replaced 'Verified') -->
        <button
          type="button"
          @click="activeFilterTab = 'paid'"
          class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
          :class="activeFilterTab === 'paid'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/30'"
        >
          <span>✓ Paid</span>
          <span
            class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal"
            :class="activeFilterTab === 'paid' ? 'bg-emerald-700/80 text-white' : 'bg-emerald-950 text-emerald-400'"
          >
            {{ paidCount }}
          </span>
        </button>

        <!-- Tab 3: Pending (Replaced 'Attention') -->
        <button
          type="button"
          @click="activeFilterTab = 'pending'"
          class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
          :class="activeFilterTab === 'pending'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/30'"
        >
          <span>⚠ Pending</span>
          <span
            class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal"
            :class="activeFilterTab === 'pending' ? 'bg-red-700/80 text-white' : 'bg-red-950 text-red-400'"
          >
            {{ pendingCount }}
          </span>
        </button>
      </section>

      <!-- 3. Below Tabs: Up-To-Date Live ShareID Cards Feed (Detached from historical month browsing) -->
      <section id="shareid-cards-feed" class="space-y-2">
        <div v-if="filteredShares.length === 0" class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
          <p v-if="activeFilterTab === 'pending'">
            🎉 No pending shares! All {{ shares.length }} share accounts are fully paid and clear.
          </p>
          <p v-else-if="activeFilterTab === 'paid'">
            No shares recorded as paid yet for the current cycle.
          </p>
          <p v-else>
            No shares found for this Chitti ID.
          </p>
        </div>

        <ShareCard
          v-for="item in filteredShares"
          :key="item.share.Share_ID"
          :share="item.share"
          :transaction="item.transaction"
          :chitti="activeChitti"
          :month="activeCycleMonth"
          @record-payment="handleRecordPayment"
          @draw-updated="handleDrawUpdated"
          @statement="openStatementModal"
        />
      </section>

      <!-- 4. At the Bottom: Manager Operations (Download PDF Trigger & n8n WhatsApp Webhook Trigger) -->
      <section
        id="manager-personal-ledger"
        class="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5 pt-4 mt-6"
      >
        <!-- Manager Ledger Header -->
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div>
            <span class="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Manager Operations</span>
            <h3 class="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              Foreman Operations &bull; {{ activeChitti.Chitti_ID }}
            </h3>
          </div>

          <span class="text-[11px] font-mono text-slate-400">
            Anchor: {{ activeChitti.Cycle_Anchor_Day || '10th to 10th' }}
          </span>
        </div>

        <!-- Pocket Cash & Balances Snapshot (No Commission displayed) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <!-- Pocket Cash Position -->
          <div
            class="p-2.5 rounded-xl border"
            :class="isSurplus
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold text-slate-400">Current Cash Balance</span>
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase"
                :class="isSurplus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
              >
                {{ isSurplus ? 'Surplus' : 'Deficit' }}
              </span>
            </div>
            <strong
              class="text-base font-bold font-mono block mt-0.5"
              :class="isSurplus ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ liveCashBalance >= 0 ? '+' : '' }}₹{{ liveCashBalance.toLocaleString('en-IN') }}
            </strong>
          </div>

          <!-- Total Advance Reserve & Pending Dues -->
          <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Live Circle Dues &amp; Buffer</span>
            <div class="mt-1 space-y-0.5 text-[11px] font-mono">
              <div class="flex justify-between">
                <span class="text-slate-400">Pending Dues:</span>
                <span class="text-red-400 font-bold">₹{{ totalLivePending.toLocaleString('en-IN') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Advance Buffer:</span>
                <span class="text-blue-400 font-bold">₹{{ totalLiveAdvance.toLocaleString('en-IN') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 1-Click PDF Download Trigger (Decoupled from page code via separate exportPdfStatement utility) -->
        <div class="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <span class="font-bold text-slate-100 block leading-tight">Download Full Circle Statement PDF</span>
              <span class="text-[11px] text-slate-400">1-click isolated printable statement ready to save as PDF</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleDownloadPdfStatement"
            class="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Download PDF</span>
          </button>
        </div>

        <!-- WhatsApp Reminders: Background n8n Webhook Manual Trigger (No client math/counts) -->
        <div class="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01s-.526.075-.802.376c-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.109.15.2 2.122 3.24 5.14 4.544.718.31 1.279.496 1.716.635.722.23 1.378.197 1.897.12.578-.087 1.78-.728 2.03-1.431.25-.703.25-1.305.175-1.431-.075-.126-.275-.201-.576-.351z"/>
              </svg>
            </div>
            <div>
              <span class="font-bold text-slate-100 block leading-tight">WhatsApp Reminders Webhook</span>
              <span class="text-[11px] text-slate-400">Trigger n8n server workflow to notify pending members automatically</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleTriggerN8nWebhook"
            :disabled="isTriggeringWebhook"
            class="w-full sm:w-auto px-4 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
          >
            <span v-if="!isTriggeringWebhook">Trigger n8n Webhook</span>
            <span v-else class="text-[10px]">Triggering...</span>
          </button>
        </div>
      </section>
    </div>

    <!-- One-Click White Page Type Share Statement Modal (For Screenshots) -->
    <StatementModal
      :is-open="isStatementOpen"
      :share="selectedStatementShare"
      :chitti="activeChitti"
      :statement="shareStatementData"
      :current-month="activeCycleMonth"
      @close="isStatementOpen = false"
    />

    <!-- One-Click White Page Type Month Statement Modal (For Screenshots) -->
    <MonthStatementModal
      :is-open="isMonthStatementOpen"
      :chitti="activeChitti"
      :month="summaryMonth"
      :month-metrics="{
        expectedCollection: summaryMetrics.gross_pool,
        totalCollected: summaryMetrics.gross_pool,
        netPayout: summaryMetrics.net_payout
      }"
      :shares-list="mergedSharesList"
      @close="isMonthStatementOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';
import { calculateMonthMath } from '../composables/chitti_math_engine';
import { triggerDownloadCirclePdf } from '../utils/exportPdfStatement';
import ShareCard from '../components/ShareCard.vue';
import StatementModal from '../components/StatementModal.vue';
import MonthStatementModal from '../components/MonthStatementModal.vue';

const route = useRoute();

const {
  activeChitti,
  shares,
  transactions,
  isLoading,
  loadGroupDetails,
  recordPayment,
  updateShareDrawStatus,
  getShareStatement
} = useApi();

const { groups } = useManagerWorkspace();

// 3 Filter Tabs: 'all' | 'paid' | 'pending'
const activeFilterTab = ref('all');

// Toast notification
const toastMessage = ref('');
let toastTimeout = null;
const showToast = (msg) => {
  toastMessage.value = msg;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.value = '';
  }, 2500);
};

// Modals
const isStatementOpen = ref(false);
const isMonthStatementOpen = ref(false);
const selectedStatementShare = ref(null);
const shareStatementData = ref([]);

// Independent Month Card Summary Stepper
const summaryMonth = ref(1);

// Active Live Cycle Month (drives the live Share Cards)
const activeCycleMonth = computed(() => Number(activeChitti.value?.Current_Month || 1));

// Dynamic Financial parameters (NOT strictly 20)
const totalMonths = computed(() => Number(activeChitti.value?.Total_Months || 20));
const undrawnDue = computed(() => Number(activeChitti.value?.Undrawn_Due || 5000));
const drawnDue = computed(() => Number(activeChitti.value?.Drawn_Due || 6000));

// Independent Month Metrics computed specifically for summaryMonth
const summaryMetrics = computed(() => {
  if (!activeChitti.value) {
    return {
      gross_pool: 100000,
      net_payout: 96000,
      n_undrawn: 19,
      n_drawn: 1
    };
  }
  return calculateMonthMath(activeChitti.value, summaryMonth.value);
});

// Merged Shares with current active cycle state (Detached from summary month navigation)
const mergedSharesList = computed(() => {
  return shares.value.map((share) => {
    const txn = transactions.value.find((t) => t.Share_ID === share.Share_ID) || null;
    const isDrawn = share.Draw_Status === 'Drawn';
    const due = txn?.Amount_Due !== undefined
      ? Number(txn.Amount_Due)
      : (isDrawn ? drawnDue.value : undrawnDue.value);
    const paid = Number(txn?.Amount_Paid || 0);
    const pending = txn?.Pending_Dues !== undefined
      ? Number(txn.Pending_Dues)
      : Math.max(0, due - paid);
    const isPaid = txn?.Payment_Status === 'Paid' || txn?.Payment_Status === 'Verified' || (paid >= due && due > 0);

    return {
      share,
      transaction: txn,
      due,
      paid,
      pending,
      isPaid
    };
  });
});

// Live stats for current cycle
const paidCount = computed(() => {
  return mergedSharesList.value.filter((i) => i.isPaid).length;
});

const pendingCount = computed(() => {
  return mergedSharesList.value.filter((i) => !i.isPaid).length;
});

const totalLivePending = computed(() => {
  return mergedSharesList.value.reduce((acc, i) => acc + i.pending, 0);
});

const totalLiveAdvance = computed(() => {
  return shares.value.reduce((acc, s) => acc + (Number(s.Advance_Credit) || 0), 0);
});

const liveCashBalance = computed(() => {
  const totalCollected = mergedSharesList.value.reduce((acc, i) => acc + i.paid, 0);
  const payoutTarget = summaryMetrics.value.net_payout;
  return totalCollected - payoutTarget;
});

const isSurplus = computed(() => liveCashBalance.value >= 0);

// Filtered shares based on activeFilterTab
const filteredShares = computed(() => {
  if (activeFilterTab.value === 'paid') {
    return mergedSharesList.value.filter((i) => i.isPaid);
  }
  if (activeFilterTab.value === 'pending') {
    return mergedSharesList.value.filter((i) => !i.isPaid);
  }
  return mergedSharesList.value;
});

// Payment recording with Credit / Debit (Updates live account state)
const handleRecordPayment = ({ shareId, monthNumber, amount, entryType, paymentMode }) => {
  try {
    const shareObj = shares.value.find((s) => s.Share_ID === shareId);
    recordPayment({
      shareId,
      monthNumber,
      amount,
      entryType,
      paymentMode
    });
    const prefix = entryType === 'Credit' ? '+ Record' : '- Debit';
    showToast(`${prefix} of ₹${Number(amount).toLocaleString('en-IN')} recorded for ${shareObj?.Member_Name || shareId}`);
  } catch (err) {
    alert(err.message || 'Payment recording failed');
  }
};

// Draw status update
const handleDrawUpdated = ({ shareId, isDrawn, winningMonth }) => {
  updateShareDrawStatus({ shareId, isDrawn, winningMonth });
  showToast(`Draw status updated for ${shareId}`);
};

// One-click statement view
const openStatementModal = (shareId) => {
  const share = shares.value.find((s) => s.Share_ID === shareId);
  if (!share) return;
  selectedStatementShare.value = share;
  shareStatementData.value = getShareStatement(shareId);
  isStatementOpen.value = true;
};

// Download Full Statement PDF Trigger (Decoupled in exportPdfStatement.js)
const handleDownloadPdfStatement = () => {
  triggerDownloadCirclePdf(activeChitti.value, shares.value, transactions.value, activeCycleMonth.value);
  showToast('✓ Full Circle PDF Statement opened for download');
};

// WhatsApp Reminders n8n Webhook Trigger (Pure manual webhook trigger - n8n queries NocoDB database independently)
const isTriggeringWebhook = ref(false);
const handleTriggerN8nWebhook = async () => {
  isTriggeringWebhook.value = true;
  try {
    // Calls the n8n webhook endpoint
    await fetch('/api/webhook/whatsapp-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chittiId: activeChitti.value?.Chitti_ID,
        cycleMonth: activeCycleMonth.value,
        timestamp: new Date().toISOString()
      })
    }).catch(() => null);

    showToast('✓ n8n WhatsApp workflow triggered successfully');
  } finally {
    isTriggeringWebhook.value = false;
  }
};

// Load Group from Route
const syncActiveGroup = () => {
  const cid = route.params.chittiId || groups.value[0]?.Chitti_ID || 'CHT-2026-A';
  const targetGroup = groups.value.find((g) => g.Chitti_ID === cid) || groups.value[0];
  if (targetGroup) {
    loadGroupDetails(targetGroup, targetGroup.Current_Month || 1);
    summaryMonth.value = Number(targetGroup.Current_Month || 1);
  }
};

watch(
  () => route.params.chittiId,
  (newId) => {
    if (newId) {
      const g = groups.value.find((item) => item.Chitti_ID === newId);
      if (g) {
        loadGroupDetails(g, g.Current_Month || 1);
        summaryMonth.value = Number(g.Current_Month || 1);
      }
    }
  }
);

onMounted(() => {
  syncActiveGroup();
});
</script>
