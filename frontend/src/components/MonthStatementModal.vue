<template>
  <div
    v-if="isOpen && chitti"
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    @click.self="$emit('close')"
  >
    <!-- Simple White Page Type Month Statement Popup to Screenshot on Demand -->
    <div
      id="printable-month-statement"
      class="bg-white text-slate-900 rounded-xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300"
    >
      <!-- Top Action Bar -->
      <div class="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Month {{ month }} Statement &bull; Ready to Screenshot
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="copyMonthSummary"
            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-[11px] transition-colors"
          >
            Copy Summary
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="text-slate-500 hover:text-slate-900 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200"
          >
            &times;
          </button>
        </div>
      </div>

      <!-- Scrollable Printable Paper Sheet -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white font-sans">
        <!-- Letterhead Header -->
        <div class="border-b-2 border-slate-900 pb-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">ClearFlow Chit Fund Management</span>
              <h2 class="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
                MONTH {{ month }} CYCLE LEDGER
              </h2>
              <p class="text-xs text-slate-600 font-mono mt-0.5">
                Group: {{ chitti.Chitti_Name }} ({{ chitti.Chitti_ID }})
              </p>
            </div>

            <div class="text-right shrink-0 font-mono text-xs">
              <span class="inline-block px-2 py-0.5 bg-blue-900 text-white font-bold rounded">
                Cycle M{{ month }} of {{ totalMonths }}
              </span>
              <span class="block text-[10px] text-slate-500 mt-1">
                Anchor: {{ chitti.Cycle_Anchor_Day || '10th to 10th' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Month Financial Snapshot Grid (No Commission, Draw Amount Instead of Winner) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] font-sans text-slate-500 block uppercase font-semibold">Gross Pool Target</span>
            <strong class="text-slate-900 text-sm font-bold">₹{{ expectedPool.toLocaleString('en-IN') }}</strong>
          </div>

          <div class="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <span class="text-[10px] font-sans text-emerald-800 block uppercase font-semibold">Total Collected</span>
            <strong class="text-emerald-900 text-sm font-bold">₹{{ totalCollected.toLocaleString('en-IN') }}</strong>
          </div>

          <div class="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <span class="text-[10px] font-sans text-amber-800 block uppercase font-semibold">This Month Draw Amount</span>
            <strong class="text-amber-900 text-sm font-bold">₹{{ netDrawAmount.toLocaleString('en-IN') }}</strong>
          </div>
        </div>

        <!-- Shares Breakdown Table for Month m -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <div class="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Share Rosters ({{ sharesList.length }} Shares)</span>
            <span class="font-mono text-[11px] text-slate-600">
              {{ paidCount }} Paid &bull; {{ pendingCount }} Pending
            </span>
          </div>

          <table class="w-full text-left text-xs text-slate-800 font-mono">
            <thead class="bg-slate-50 text-slate-600 font-sans font-semibold border-b border-slate-200 text-[10px] uppercase">
              <tr>
                <th class="py-2 px-2.5">#</th>
                <th class="py-2 px-2.5">Member Name</th>
                <th class="py-2 px-2.5">Status</th>
                <th class="py-2 px-2.5 text-right">Due Rate</th>
                <th class="py-2 px-2.5 text-right">Paid</th>
                <th class="py-2 px-2.5 text-right">Pending</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="item in sharesList"
                :key="item.share.Share_ID"
                class="hover:bg-slate-50/80"
              >
                <td class="py-2 px-2.5 font-bold text-slate-500">
                  #{{ String(item.share.Share_Number).padStart(2, '0') }}
                </td>

                <td class="py-2 px-2.5 font-sans font-medium text-slate-900">
                  {{ item.share.Member_Name }}
                </td>

                <td class="py-2 px-2.5 font-sans text-[10px]">
                  <span
                    class="px-1.5 py-0.2 rounded font-medium"
                    :class="item.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ item.isPaid ? 'Paid' : 'Pending' }}
                  </span>
                </td>

                <td class="py-2 px-2.5 text-right font-medium">
                  ₹{{ item.due.toLocaleString('en-IN') }}
                </td>

                <td class="py-2 px-2.5 text-right font-bold text-emerald-700">
                  ₹{{ item.paid.toLocaleString('en-IN') }}
                </td>

                <td
                  class="py-2 px-2.5 text-right font-bold"
                  :class="item.pending > 0 ? 'text-red-700' : 'text-slate-400'"
                >
                  ₹{{ item.pending.toLocaleString('en-IN') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Watermark & Footer Note -->
        <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Official Month Statement &bull; ClearFlow Architecture</span>
          <span>Date: {{ currentDate }}</span>
        </div>
      </div>

      <!-- Modal Bottom Actions -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span class="text-xs text-slate-500">
          Tip: Take a screenshot to post to group
        </span>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  chitti: { type: Object, default: () => ({}) },
  month: { type: Number, default: 1 },
  monthMetrics: { type: Object, default: () => ({}) },
  sharesList: { type: Array, default: () => [] }
});

defineEmits(['close']);

const totalMonths = computed(() => Number(props.chitti?.Total_Months || 20));
const expectedPool = computed(() => Number(props.monthMetrics?.expectedCollection || 0));
const totalCollected = computed(() => Number(props.monthMetrics?.totalCollected || 0));
const netDrawAmount = computed(() => Number(props.monthMetrics?.netPayout || 0));

const paidCount = computed(() => props.sharesList.filter((i) => i.isPaid).length);
const pendingCount = computed(() => props.sharesList.filter((i) => !i.isPaid).length);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
});

const copyMonthSummary = () => {
  let text = `📄 *CLEARFLOW MONTH ${props.month} STATEMENT*\n`;
  text += `Group: ${props.chitti?.Chitti_Name} (${props.chitti?.Chitti_ID})\n\n`;
  text += `• Target Pool: ₹${expectedPool.value.toLocaleString('en-IN')}\n`;
  text += `• Total Collected: ₹${totalCollected.value.toLocaleString('en-IN')}\n`;
  text += `• This Month Draw Amount: ₹${netDrawAmount.value.toLocaleString('en-IN')}\n`;
  text += `• Paid: ${paidCount.value} / ${props.sharesList.length}\n`;
  text += `• Pending: ${pendingCount.value}\n`;
  navigator.clipboard.writeText(text);
  alert('Month statement summary copied to clipboard!');
};
</script>
