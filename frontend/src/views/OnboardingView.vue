<template>
  <div id="onboarding-view" class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Universal Onboarding Wizard</span>
        <h1 class="text-2xl font-bold text-slate-100 mt-1">Start a Dynamic Chit Group</h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Step-by-step parameterized provisioning with isolated Share_ID roster and dynamic math validation.
        </p>
      </div>
      <router-link
        to="/home"
        class="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
      >
        &larr; Back to Groups
      </router-link>
    </div>

    <!-- Step Progress Bar -->
    <div class="grid grid-cols-4 gap-2 text-xs">
      <div
        v-for="(st, idx) in steps"
        :key="idx"
        class="p-2.5 rounded-xl border text-center transition-colors"
        :class="currentStep === idx + 1
          ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-bold'
          : (currentStep > idx + 1 ? 'bg-slate-900 border-slate-700 text-emerald-400 font-medium' : 'bg-slate-950 border-slate-800 text-slate-500')"
      >
        <span class="block text-[10px] uppercase">Step {{ idx + 1 }}</span>
        <span class="truncate block text-xs">{{ st }}</span>
      </div>
    </div>

    <!-- Error Banner -->
    <div
      v-if="validationError"
      class="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3.5 text-xs text-rose-300 flex items-center gap-2"
    >
      <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{{ validationError }}</span>
    </div>

    <!-- STEP 1: Group Identity & Template -->
    <div v-if="currentStep === 1" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
      <h2 class="text-sm font-bold text-slate-200 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Step 1: Group Identity &amp; Rule Template
      </h2>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Chitti Group Name <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.Chitti_Name"
            type="text"
            required
            placeholder="e.g. Swarna Chitti 2026 (Group C)"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Rule Template <span class="text-rose-400">*</span>
          </label>
          <select
            v-model="form.Rule_Template"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="Incremental Model V1">Incremental Model V1 (Dynamic Winner Payout)</option>
            <option value="Fixed Pool Model">Fixed Pool Model</option>
            <option value="Standard Auction Model">Standard Auction Model</option>
          </select>
          <p class="text-[11px] text-slate-400 mt-1">
            Incremental Model V1 dynamically increases monthly pool by (Drawn Due - Undrawn Due) as members take prize.
          </p>
        </div>
      </div>

      <div class="pt-3 flex justify-end">
        <button
          type="button"
          @click="goToStep(2)"
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Next: Financial Parameters &rarr;
        </button>
      </div>
    </div>

    <!-- STEP 2: Mandatory Financial Parameters -->
    <div v-else-if="currentStep === 2" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
      <h2 class="text-sm font-bold text-slate-200 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Step 2: Mandatory Financial Parameters (Strict Positive Numbers)
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Total Members / Shares (S) <span class="text-rose-400">*</span>
          </label>
          <input
            v-model.number="form.Total_Members"
            type="number"
            min="2"
            max="100"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Total Months / Duration (M) <span class="text-rose-400">*</span>
          </label>
          <input
            v-model.number="form.Total_Months"
            type="number"
            min="2"
            max="100"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Undrawn Member Due (₹ / month) <span class="text-rose-400">*</span>
          </label>
          <input
            v-model.number="form.Undrawn_Due"
            type="number"
            min="100"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
          <span class="text-[10px] text-blue-400">Rate paid by saver members</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Drawn Member Due (₹ / month) <span class="text-rose-400">*</span>
          </label>
          <input
            v-model.number="form.Drawn_Due"
            type="number"
            min="100"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
          <span class="text-[10px] text-emerald-400">Rate paid by prized members (&ge; Undrawn)</span>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Manager Monthly Earned Commission (C) (₹) <span class="text-rose-400">*</span>
          </label>
          <input
            v-model.number="form.Monthly_Commission"
            type="number"
            min="0"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
          <span class="text-[10px] text-slate-400">Fixed monthly revenue across all M cycles</span>
        </div>
      </div>

      <!-- Live Dynamic Math Engine Preview -->
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
        <span class="font-bold text-slate-300 uppercase text-[10px] block">
          Live Dynamic Math Simulation:
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
          <div class="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-[10px] font-sans">Month 1 Pool</span>
            <strong class="text-blue-400 text-sm">₹{{ liveMathM1.gross_pool.toLocaleString('en-IN') }}</strong>
          </div>
          <div class="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-[10px] font-sans">Month 1 Payout W(1)</span>
            <strong class="text-amber-400 text-sm">₹{{ liveMathM1.net_payout.toLocaleString('en-IN') }}</strong>
          </div>
          <div class="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-[10px] font-sans">Final Month {{ form.Total_Months }} Pool</span>
            <strong class="text-emerald-400 text-sm">₹{{ liveMathMFinal.gross_pool.toLocaleString('en-IN') }}</strong>
          </div>
          <div class="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-[10px] font-sans">Final Payout W({{ form.Total_Months }})</span>
            <strong class="text-amber-400 text-sm">₹{{ liveMathMFinal.net_payout.toLocaleString('en-IN') }}</strong>
          </div>
        </div>
      </div>

      <div class="pt-3 flex items-center justify-between">
        <button
          type="button"
          @click="currentStep = 1"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
        >
          &larr; Back
        </button>
        <button
          type="button"
          @click="goToStep(3)"
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Next: Cycle Anchor &rarr;
        </button>
      </div>
    </div>

    <!-- STEP 3: Standardized Cycle Calendar Anchor -->
    <div v-else-if="currentStep === 3" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
      <h2 class="text-sm font-bold text-slate-200 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Step 3: Standardized Cycle Calendar Anchor
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Circle Start Month &bull; Year <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.Start_Month_Year"
            type="month"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Fixed Cycle Anchor Day (STRICT DROPDOWN ONLY) <span class="text-rose-400">*</span>
          </label>
          <select
            v-model="form.Cycle_Anchor_Day"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="1st to 1st">1st to 1st of every month</option>
            <option value="5th to 5th">5th to 5th of every month</option>
            <option value="10th to 10th">10th to 10th of every month</option>
            <option value="15th to 15th">15th to 15th of every month</option>
            <option value="20th to 20th">20th to 20th of every month</option>
            <option value="25th to 25th">25th to 25th of every month</option>
          </select>
          <p class="text-[11px] text-slate-400 mt-1">
            All cycle notifications, statements, and WhatsApp alerts automatically synchronize around this anchor day.
          </p>
        </div>
      </div>

      <div class="pt-3 flex items-center justify-between">
        <button
          type="button"
          @click="currentStep = 2"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
        >
          &larr; Back
        </button>
        <button
          type="button"
          @click="goToStep(4)"
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Next: Member Roster &rarr;
        </button>
      </div>
    </div>

    <!-- STEP 4: Member Roster Addition -->
    <div v-else-if="currentStep === 4" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Step 4: Member Roster Addition ({{ rosterMembers.length }} Members)
          </h2>
          <p class="text-xs text-slate-400">
            Day 1 spawns ONLY these share records. Zero future transaction rows exist until cycle begins.
          </p>
        </div>
      </div>

      <!-- Scrollable Roster Table -->
      <div class="max-h-80 overflow-y-auto border border-slate-800 rounded-xl">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th class="py-2 px-3">#</th>
              <th class="py-2 px-3">Custom Share ID</th>
              <th class="py-2 px-3">Member Full Name</th>
              <th class="py-2 px-3">Phone Number (+91 format)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr v-for="(m, idx) in rosterMembers" :key="idx" class="hover:bg-slate-800/30">
              <td class="py-2 px-3 text-slate-400 font-bold">#{{ String(idx + 1).padStart(2, '0') }}</td>
              <td class="py-1.5 px-3">
                <input
                  v-model="m.Share_ID"
                  type="text"
                  required
                  class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-blue-300 w-28 focus:outline-none focus:border-blue-500"
                />
              </td>
              <td class="py-1.5 px-3 font-sans">
                <input
                  v-model="m.Member_Name"
                  type="text"
                  required
                  class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 w-full focus:outline-none focus:border-blue-500"
                />
              </td>
              <td class="py-1.5 px-3">
                <input
                  v-model="m.Phone_Number"
                  type="text"
                  required
                  class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 w-36 focus:outline-none focus:border-blue-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pt-3 flex items-center justify-between">
        <button
          type="button"
          @click="currentStep = 3"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
        >
          &larr; Back
        </button>
        <button
          type="button"
          @click="handleProvisionCircle"
          class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Provision &amp; Launch Circle</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useManagerWorkspace } from '../composables/useManagerWorkspace';
import { calculateMonthMath } from '../composables/chitti_math_engine';

const router = useRouter();
const { addGroup } = useManagerWorkspace();

const currentStep = ref(1);
const steps = ['Identity & Template', 'Financial Params', 'Calendar Anchor', 'Member Roster'];
const validationError = ref('');

const form = reactive({
  Chitti_Name: '',
  Rule_Template: 'Incremental Model V1',
  Total_Members: 20,
  Total_Months: 20,
  Undrawn_Due: 5000,
  Drawn_Due: 6000,
  Monthly_Commission: 4000,
  Start_Month_Year: new Date().toISOString().slice(0, 7),
  Cycle_Anchor_Day: '10th to 10th'
});

const rosterMembers = ref([]);

const syncRosterSlots = () => {
  const S = Math.max(2, Number(form.Total_Members) || 20);
  const currentLen = rosterMembers.value.length;

  if (currentLen < S) {
    for (let i = currentLen; i < S; i++) {
      const num = String(i + 1).padStart(2, '0');
      rosterMembers.value.push({
        Share_ID: `S${num}`,
        Member_Name: i === 0 ? 'Foreman Member' : `Member ${i + 1}`,
        Phone_Number: `+91 9845${String(i).padStart(1, '0')} 12345`
      });
    }
  } else if (currentLen > S) {
    rosterMembers.value = rosterMembers.value.slice(0, S);
  }
};

syncRosterSlots();

watch(() => form.Total_Members, syncRosterSlots);

const liveMathM1 = computed(() => {
  return calculateMonthMath({
    Total_Members: form.Total_Members,
    Total_Months: form.Total_Months,
    Monthly_Commission: form.Monthly_Commission,
    Undrawn_Due: form.Undrawn_Due,
    Drawn_Due: form.Drawn_Due
  }, 1);
});

const liveMathMFinal = computed(() => {
  return calculateMonthMath({
    Total_Members: form.Total_Members,
    Total_Months: form.Total_Months,
    Monthly_Commission: form.Monthly_Commission,
    Undrawn_Due: form.Undrawn_Due,
    Drawn_Due: form.Drawn_Due
  }, Number(form.Total_Months) || 20);
});

const goToStep = (step) => {
  validationError.value = '';

  if (step === 2) {
    if (!form.Chitti_Name.trim()) {
      validationError.value = 'Please provide a valid Chitti Group Name.';
      return;
    }
  }

  if (step === 3) {
    if (form.Total_Members < 2 || form.Total_Months < 2) {
      validationError.value = 'Total Members and Months must be at least 2.';
      return;
    }
    if (form.Undrawn_Due <= 0 || form.Drawn_Due <= 0) {
      validationError.value = 'Dues must be strictly positive amounts.';
      return;
    }
    if (form.Drawn_Due < form.Undrawn_Due) {
      validationError.value = 'Drawn Due cannot be less than Undrawn Due in Incremental Model.';
      return;
    }
  }

  currentStep.value = step;
};

const handleProvisionCircle = () => {
  validationError.value = '';

  try {
    const created = addGroup({
      Chitti_Name: form.Chitti_Name,
      Rule_Template: form.Rule_Template,
      Total_Members: form.Total_Members,
      Total_Months: form.Total_Months,
      Monthly_Commission: form.Monthly_Commission,
      Undrawn_Due: form.Undrawn_Due,
      Drawn_Due: form.Drawn_Due,
      Cycle_Anchor_Day: form.Cycle_Anchor_Day,
      Start_Date: `${form.Start_Month_Year}-01`,
      members: rosterMembers.value
    });

    router.push(`/groups/${created.Chitti_ID}`);
  } catch (err) {
    validationError.value = err.message || 'Failed to provision new Chitti Group';
  }
};
</script>
