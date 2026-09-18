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
      <p class="text-xs text-slate-400">Please select a Chitti ID from the sidebar or return to Home.</p>
      <router-link
        to="/home"
        class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
      >
        Go to Home
      </router-link>
    </div>

    <!-- Active Single-Page View -->
    <div v-else class="space-y-3.5">
      <!-- 1. Top: Month Summary Card with Quick Statement & Manager Ledger Access -->
      <section
        id="month-summary-card"
        class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-sm space-y-2.5"
      >
        <!-- Header: Month Number, Stepper, Statement, and Manager Ledger -->
        <div class="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                {{ formattedMonthHeader }}
              </h2>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                {{ activeChitti.Chitti_ID }}
              </span>
            </div>

            <!-- In small text: Draw amount for that month -->
            <div class="text-xs text-purple-300 font-mono font-medium mt-0.5">
              Draw Amount: ₹{{ (monthCardData.drawAmount || 0).toLocaleString('en-IN') }}
            </div>
          </div>

          <!-- Action Triggers: Manager Personal Ledger, Month Statement, and Month Stepper -->
          <div class="flex items-center gap-1.5 shrink-0 mt-0.5">
            <!-- Manager Personal Ledger Button -->
            <button
              type="button"
              @click="isManagerLedgerOpen = true"
              class="text-[11px] px-2 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 border border-purple-700/50 transition-colors flex items-center gap-1 shrink-0"
              title="View Manager Personal Ledger (Commission, Foreman Share, Pocket Cash)"
            >
              <svg class="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Manager Ledger</span>
            </button>

            <!-- One-Click Month Statement Button -->
            <button
              type="button"
              @click="isMonthStatementOpen = true"
              class="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
              title="View Statement for this Month"
            >
              <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Statement</span>
            </button>

            <!-- Month Stepper -->
            <div class="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
              <button
                type="button"
                @click="prevSummaryMonth"
                :disabled="summaryMonth <= 1"
                class="w-6 h-6 rounded flex items-center justify-center text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Month"
              >
                &larr;
              </button>
              <span class="px-1.5 font-mono text-xs font-bold text-slate-300">
                M{{ summaryMonth }}
              </span>
              <button
                type="button"
                @click="nextSummaryMonth"
                :disabled="summaryMonth >= totalMonths"
                class="w-6 h-6 rounded flex items-center justify-center text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Month"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Month Card Content: Total collection, pending collection, paid count, pending count -->
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <!-- Total Collection of that Month -->
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400 font-sans block">Total Collection</span>
            <strong class="text-sm font-bold text-emerald-400">
              ₹{{ (monthCardData.totalCollected || 0).toLocaleString('en-IN') }}
            </strong>
            <span class="text-[10px] text-slate-500 block font-sans mt-0.5">
              Target: ₹{{ (summaryMetrics.gross_pool || 0).toLocaleString('en-IN') }}
            </span>
          </div>

          <!-- Pending Collection of that Month -->
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400 font-sans block">Pending Collection</span>
            <strong
              class="text-sm font-bold"
              :class="monthCardData.totalPending > 0 ? 'text-red-400' : 'text-slate-400'"
            >
              ₹{{ (monthCardData.totalPending || 0).toLocaleString('en-IN') }}
            </strong>
            <span class="text-[10px] text-slate-500 block font-sans mt-0.5">
              {{ monthCardData.paidCount }} Paid &bull; {{ monthCardData.pendingCount }} Pending
            </span>
          </div>
        </div>

        <!-- Pocket Cash & Advance Info Bar -->
        <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
          <div>
            <span class="text-slate-400">Net Balance: </span>
            <span :class="isSurplus ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
              {{ isSurplus ? '+' : '' }}₹{{ liveCashBalance.toLocaleString('en-IN') }}
            </span>
          </div>
          <div>
            <span class="text-slate-400">Advances: </span>
            <span class="text-blue-400 font-bold">₹{{ totalLiveAdvance.toLocaleString('en-IN') }}</span>
          </div>
        </div>
      </section>

      <!-- 2. Sticky Filter Bar (Clean: Only All / Paid / Pending tabs) -->
      <section
        id="sticky-actions-bar"
        class="sticky top-14 z-30 bg-slate-950/95 backdrop-blur-md py-2 px-1 border-b border-slate-800/80 space-y-2"
      >
        <!-- 3 Filter Tabs (All / Paid / Pending) -->
        <div class="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            @click="activeFilterTab = 'all'"
            class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            :class="activeFilterTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
          >
            <span>All</span>
            <span class="text-[10px] font-mono px-1 rounded bg-black/25">
              {{ mergedSharesList.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeFilterTab = 'paid'"
            class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            :class="activeFilterTab === 'paid'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
          >
            <span>Paid</span>
            <span class="text-[10px] font-mono px-1 rounded bg-black/25">
              {{ paidCount }}
            </span>
          </button>

          <button
            type="button"
            @click="activeFilterTab = 'pending'"
            class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            :class="activeFilterTab === 'pending'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
          >
            <span>Pending</span>
            <span class="text-[10px] font-mono px-1 rounded bg-black/25">
              {{ pendingCount }}
            </span>
          </button>
        </div>
      </section>

      <!-- 3. Roster of Single-View Share Cards -->
      <section id="shares-roster" class="space-y-3">
        <div v-if="filteredShares.length === 0" class="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
          No shares match the "{{ activeFilterTab }}" filter.
        </div>

        <ShareCard
          v-for="item in filteredShares"
          :key="item.share.Share_ID"
          :share="item.share"
          :chitti="activeChitti"
          :transaction="item.transaction"
          :month="activeCycleMonth"
          @record-payment="handleRecordPayment"
          @draw-updated="handleDrawUpdated"
          @open-statement="openStatementModal"
        />
      </section>

      <!-- 4. Bottom Section: Overall Statement PDF, WhatsApp Reminders, and Delete Circle -->
      <section id="circle-bottom-actions" class="pt-6 border-t border-slate-800/80 space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Circle Reports &amp; Member Reminders</span>
          <span class="text-[10px] text-slate-500 font-mono">Cycle M{{ activeCycleMonth }} of {{ totalMonths }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Download Full Circle Statement PDF -->
          <button
            type="button"
            @click="handleDownloadPdfStatement"
            class="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            title="Download / Print Overall Circle Statement PDF"
          >
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Download Overall Statement PDF</span>
          </button>

          <!-- WhatsApp Reminders Trigger -->
          <button
            type="button"
            @click="promptSendWebhook"
            :disabled="isTriggeringWebhook || pendingCount === 0"
            class="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span v-if="isTriggeringWebhook">Sending Reminders...</span>
            <span v-else>Send WhatsApp Reminders ({{ pendingCount }} Pending)</span>
          </button>
        </div>
      </section>
    </div>

    <!-- Confirmation Modal for WhatsApp Reminders Webhook -->
    <div
      v-if="showSendConfirmModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      @click.self="showSendConfirmModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>

        <div class="text-center space-y-1">
          <h3 class="text-base font-bold text-slate-100">Send WhatsApp Reminders?</h3>
          <p class="text-xs text-slate-400">
            This will trigger payment reminder notifications to {{ pendingCount }} member(s) with pending dues for Month {{ activeCycleMonth }}.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            @click="showSendConfirmModal = false"
            class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmAndSendHttpsRequest"
            class="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow"
          >
            Confirm &amp; Send
          </button>
        </div>
      </div>
    </div>

    <!-- Manager Personal Ledger Modal -->
    <ManagerPersonalLedgerModal
      :is-open="isManagerLedgerOpen"
      :ledger="managerLedgerData"
      @close="isManagerLedgerOpen = false"
    />

    <!-- Preloaded Zero-Overhead Share Statement Modal -->
    <StatementModal
      :is-open="isStatementOpen"
      :share="selectedStatementShare"
      :chitti="activeChitti"
      :statement="shareStatementData"
      :current-month="activeCycleMonth"
      :preloaded-data="preloadedShareStatement"
      @close="isStatementOpen = false"
    />

    <!-- Preloaded Zero-Overhead Month Statement Modal -->
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
      :preloaded-data="preloadedMonthStatement"
      @close="isMonthStatementOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';
import {
  calculateMonthMath,
  calculateMonthCardSummary,
  calculateMergedShares,
  calculatePocketCash,
  calculateShareStatementData,
  calculateMonthStatementData,
  calculateManagerPersonalLedger
} from '../composables/chitti_math_engine';
import { triggerDownloadCirclePdf } from '../utils/exportPdfStatement';
import ShareCard from '../components/ShareCard.vue';
import StatementModal from '../components/StatementModal.vue';
import MonthStatementModal from '../components/MonthStatementModal.vue';
import ManagerPersonalLedgerModal from '../components/ManagerPersonalLedgerModal.vue';

const route = useRoute();
const router = useRouter();

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

const { groups, deleteGroup } = useManagerWorkspace();

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
const isManagerLedgerOpen = ref(false);
const selectedStatementShare = ref(null);
const shareStatementData = ref([]);

// Active cycle month of the chitti group
const activeCycleMonth = computed(() => Number(activeChitti.value?.Current_Month || 1));
const totalMonths = computed(() => Number(activeChitti.value?.Total_Months || 20));

// Summary Month Stepper state (navigable 1..Total_Months)
const summaryMonth = ref(1);

// Step Summary Month
const prevSummaryMonth = () => {
  if (summaryMonth.value > 1) {
    summaryMonth.value--;
  }
};

const nextSummaryMonth = () => {
  if (summaryMonth.value < totalMonths.value) {
    summaryMonth.value++;
  }
};

// Summary metrics calculated strictly via domain math engine
const summaryMetrics = computed(() => {
  return calculateMonthMath(activeChitti.value, summaryMonth.value);
});

// Dynamic formatted header: Month number, Month Name (e.g. January), and Year
const formattedMonthHeader = computed(() => {
  const startYear = 2026;
  const startMonthIndex = 0; // January
  const totalOffset = startMonthIndex + (summaryMonth.value - 1);
  const currentYear = startYear + Math.floor(totalOffset / 12);
  const monthIdx = ((totalOffset % 12) + 12) % 12;
  const d = new Date(currentYear, monthIdx, 1);
  const monthName3 = d.toLocaleString('en-US', { month: 'short' });
  return `Month ${summaryMonth.value} • ${monthName3} ${currentYear}`;
});

// Merged Shares with current active cycle state (Decoupled from UI, computed via pure math engine)
const mergedSharesList = computed(() => {
  return calculateMergedShares({
    chitti: activeChitti.value,
    month: activeCycleMonth.value,
    shares: shares.value,
    transactions: transactions.value
  });
});

// Month Card Data: calculated via domain math engine
const monthCardData = computed(() => {
  return calculateMonthCardSummary({
    chitti: activeChitti.value,
    summaryMonth: summaryMonth.value,
    activeCycleMonth: activeCycleMonth.value,
    shares: shares.value,
    transactions: transactions.value
  });
});

// Live stats for current cycle
const paidCount = computed(() => monthCardData.value?.paidCount ?? 0);
const pendingCount = computed(() => monthCardData.value?.pendingCount ?? 0);

// Pocket cash and financial balances from domain math engine
const pocketCash = computed(() => {
  return calculatePocketCash({
    chitti: activeChitti.value,
    month: activeCycleMonth.value,
    transactions: transactions.value,
    shares: shares.value
  });
});

const totalLiveAdvance = computed(() => pocketCash.value?.totalAdvanceReserve ?? 0);
const liveCashBalance = computed(() => pocketCash.value?.cashWithoutAdvances ?? 0);
const isSurplus = computed(() => pocketCash.value?.isSurplusWithoutAdvances ?? true);

// Manager Personal Ledger computed directly from domain math engine
const managerLedgerData = computed(() => {
  return calculateManagerPersonalLedger({
    chitti: activeChitti.value,
    activeMonth: activeCycleMonth.value,
    shares: shares.value,
    transactions: transactions.value
  });
});

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

// Preloaded Up-to-Date Month Statement Snippet from Math Engine
const preloadedMonthStatement = computed(() => {
  return calculateMonthStatementData({
    chitti: activeChitti.value,
    month: summaryMonth.value,
    shares: shares.value,
    transactions: transactions.value
  });
});

// Preloaded Up-to-Date Share Statement Snippet from Math Engine
const preloadedShareStatement = computed(() => {
  if (!selectedStatementShare.value) return null;
  return calculateShareStatementData({
    chitti: activeChitti.value,
    share: selectedStatementShare.value,
    statement: shareStatementData.value,
    currentMonth: activeCycleMonth.value
  });
});

// Actions
const handleRecordPayment = ({ shareId, amount, entryType, paymentMode }) => {
  try {
    const monthNumber = activeCycleMonth.value;
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

// Download Full Statement PDF Trigger (Decoupled in exportPdfStatement.js with single trigger line)
const handleDownloadPdfStatement = () => {
  triggerDownloadCirclePdf(activeChitti.value, shares.value, transactions.value, activeCycleMonth.value);
};

// WhatsApp Reminders: Ask confirmation before sending HTTPS request
const isTriggeringWebhook = ref(false);
const showSendConfirmModal = ref(false);

const promptSendWebhook = () => {
  showSendConfirmModal.value = true;
};

const confirmAndSendHttpsRequest = async () => {
  showSendConfirmModal.value = false;
  isTriggeringWebhook.value = true;
  try {
    await fetch('/api/webhook/whatsapp-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chittiId: activeChitti.value?.Chitti_ID,
        cycleMonth: activeCycleMonth.value,
        timestamp: new Date().toISOString()
      })
    }).catch(() => null);

    showToast('✓ Reminders sent successfully');
  } finally {
    isTriggeringWebhook.value = false;
  }
};

const syncActiveGroup = () => {
  const chittiId = route.params.chittiId || groups.value[0]?.Chitti_ID;
  if (!chittiId) return;
  const g = groups.value.find((item) => item.Chitti_ID === chittiId);
  if (g) {
    loadGroupDetails(g, g.Current_Month || 1);
    summaryMonth.value = Number(g.Current_Month || 1);
  }
};

// Initialize immediately in setup
syncActiveGroup();

watch(
  () => route.params.chittiId,
  (newId) => {
    if (newId) {
      const g = groups.value.find((item) => item.Chitti_ID === newId);
      if (g) {
        loadGroupDetails(g, g.Current_Month || 1);
        summaryMonth.value = Number(g.Current_Month || 1);
      }
    } else {
      syncActiveGroup();
    }
  }
);

onMounted(() => {
  syncActiveGroup();
});
</script>
