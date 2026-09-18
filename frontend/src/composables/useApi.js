import { ref, computed } from 'vue';
import { generateSampleShares, generateSampleTransactions } from './sampleWorkspace';
import {
  calculateMonthMath,
  calculatePocketCash,
  generateFinancialMatrix,
  settleAdvanceCredit,
  normalizeChittiParams
} from './chitti_math_engine';

const STORAGE_SHARES_KEY = 'clearflow_shares_store_v2';
const STORAGE_TXNS_KEY = 'clearflow_txns_store_v2';

const sharesMap = ref({});
const transactionsMap = ref({});

const initStores = () => {
  try {
    const savedShares = localStorage.getItem(STORAGE_SHARES_KEY);
    if (savedShares) {
      sharesMap.value = JSON.parse(savedShares);
    }
    const savedTxns = localStorage.getItem(STORAGE_TXNS_KEY);
    if (savedTxns) {
      transactionsMap.value = JSON.parse(savedTxns);
    }
  } catch (e) {
    console.warn('Failed to parse store data:', e);
  }
};

initStores();

const saveStores = () => {
  try {
    localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(sharesMap.value));
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(transactionsMap.value));
  } catch (e) {
    console.warn('Failed to save store data:', e);
  }
};

export function useApi() {
  const activeChitti = ref(null);
  const currentMonth = ref(1);
  const shares = ref([]);
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  let loadSequence = 0;

  /**
   * Spawns transaction rows for a specific cycle month on demand,
   * applying automatic advance credit settlement.
   */
  const spawnMonthCycleIfNeeded = (chitti, month) => {
    if (!chitti) return;
    const cid = chitti.Chitti_ID;
    const allTxns = transactionsMap.value[cid] || [];
    const existingMonthTxns = allTxns.filter((t) => t.Month_Number === month);

    if (existingMonthTxns.length > 0) {
      return; // Already spawned
    }

    const currentShares = sharesMap.value[cid] || [];
    const newTxns = [];

    currentShares.forEach((share) => {
      const isDrawnAtMonth = share.Month_Drawn !== null && share.Month_Drawn < month;
      const amountDue = isDrawnAtMonth ? Number(chitti.Drawn_Due) : Number(chitti.Undrawn_Due);

      // Check advance credit settlement engine
      const settlement = settleAdvanceCredit(share, amountDue);

      if (settlement.deductedCredit > 0) {
        share.Advance_Credit = settlement.newAdvanceCredit;
      }

      newTxns.push({
        Trans_ID: `${cid}_M${month}_${share.Share_ID}`,
        Share_ID: share.Share_ID,
        Chitti_ID: cid,
        Month_Number: month,
        Draw_Status: isDrawnAtMonth ? 'Drawn' : 'Undrawn',
        Amount_Due: amountDue,
        Amount_Paid: settlement.amountPaid,
        Pending_Dues: settlement.pendingDues,
        Payment_Status: settlement.paymentStatus,
        Payment_Mode: settlement.deductedCredit > 0 ? 'Advance Credit' : 'UPI',
        Payment_Date: settlement.deductedCredit > 0 ? new Date().toISOString().split('T')[0] : null,
        Payment_Ref: settlement.deductedCredit > 0 ? `ADV-SETTLE-M${month}` : null,
        Entry_Type: 'Credit'
      });
    });

    transactionsMap.value[cid] = [...allTxns, ...newTxns];
    saveStores();
  };

  /**
   * Initializes shares and seed data for chitti group
   */
  const ensureChittiData = (chitti) => {
    if (!chitti) return;
    const cid = chitti.Chitti_ID;

    if (!sharesMap.value[cid] || sharesMap.value[cid].length === 0) {
      sharesMap.value[cid] = generateSampleShares(cid);
    }

    if (!transactionsMap.value[cid] || transactionsMap.value[cid].length === 0) {
      const allTxns = [];
      sharesMap.value[cid].forEach((share) => {
        const shareTxns = generateSampleTransactions(chitti, share);
        allTxns.push(...shareTxns);
      });
      transactionsMap.value[cid] = allTxns;
      saveStores();
    }
  };

  /**
   * Loads group details and synchronizes current month feed
   */
  const loadGroupDetails = async (chitti, month = null) => {
    if (!chitti) return;
    const sequence = ++loadSequence;
    isLoading.value = true;
    error.value = null;

    activeChitti.value = chitti;
    currentMonth.value = month !== null ? Number(month) : Number(chitti.Current_Month || 1);

    try {
      ensureChittiData(chitti);
      spawnMonthCycleIfNeeded(chitti, currentMonth.value);

      if (sequence !== loadSequence) return;

      shares.value = sharesMap.value[chitti.Chitti_ID] || [];
      const allTxns = transactionsMap.value[chitti.Chitti_ID] || [];

      transactions.value = allTxns.filter((t) => t.Month_Number === currentMonth.value);
    } catch (err) {
      console.error('Failed to load group details:', err);
      error.value = err.message || 'Failed to load group data';
    } finally {
      if (sequence === loadSequence) {
        isLoading.value = false;
      }
    }
  };

  /**
   * Dynamic Month Metrics powered by isolated math engine
   */
  const monthMetrics = computed(() => {
    if (!activeChitti.value) {
      return {
        expectedCollection: 0,
        totalCollected: 0,
        pendingCollection: 0,
        collectionRate: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0,
        drawnCount: 0,
        undrawnCount: 0,
        monthlyCommission: 0,
        netPayout: 0,
        pocketCashSurplus: 0,
        cashWithoutAdvances: 0,
        cashWithAdvances: 0,
        totalAdvanceReserve: 0,
        isSurplusWithoutAdvances: true,
        isSurplusWithAdvances: true
      };
    }

    const cid = activeChitti.value.Chitti_ID;
    const allTxns = transactionsMap.value[cid] || [];
    const monthTxns = allTxns.filter((t) => t.Month_Number === currentMonth.value);
    const currentShares = sharesMap.value[cid] || [];

    const pocketData = calculatePocketCash({
      chitti: activeChitti.value,
      month: currentMonth.value,
      transactions: monthTxns,
      shares: currentShares
    });

    return {
      expectedCollection: pocketData.expectedPool,
      totalCollected: pocketData.totalCollected,
      pendingCollection: pocketData.pendingCollection,
      collectionRate: pocketData.collectionRate,
      paidCount: pocketData.paidCount,
      partialCount: pocketData.partialCount,
      pendingCount: pocketData.pendingCount,
      drawnCount: pocketData.nDrawn,
      undrawnCount: pocketData.nUndrawn,
      monthlyCommission: pocketData.commission,
      netPayout: pocketData.netPayout,
      pocketCashSurplus: pocketData.cashWithoutAdvances,
      cashWithoutAdvances: pocketData.cashWithoutAdvances,
      cashWithAdvances: pocketData.cashWithAdvances,
      totalAdvanceReserve: pocketData.totalAdvanceReserve,
      isSurplusWithoutAdvances: pocketData.isSurplusWithoutAdvances,
      isSurplusWithAdvances: pocketData.isSurplusWithAdvances
    };
  });

  /**
   * Dynamic Master 20-Month Financial Matrix
   */
  const masterMatrix = computed(() => {
    if (!activeChitti.value) return [];
    return generateFinancialMatrix(activeChitti.value);
  });

  /**
   * Portfolio-wide metrics across all historical months for active chitti
   */
  const portfolioSummary = computed(() => {
    if (!activeChitti.value) {
      return {
        totalPendingDues: 0,
        totalAdvanceReserve: 0,
        totalEarnedCommission: 0,
        cyclesCompleted: 0
      };
    }

    const cid = activeChitti.value.Chitti_ID;
    const allTxns = transactionsMap.value[cid] || [];
    const currentShares = sharesMap.value[cid] || [];

    const totalPendingDues = allTxns.reduce((sum, t) => sum + Number(t.Pending_Dues || 0), 0);
    const totalAdvanceReserve = currentShares.reduce((sum, s) => sum + Number(s.Advance_Credit || 0), 0);
    
    // Total commission earned across months up to current month
    const commission = Number(activeChitti.value.Monthly_Commission || 4000);
    const totalEarnedCommission = currentMonth.value * commission;

    return {
      totalPendingDues,
      totalAdvanceReserve,
      totalEarnedCommission,
      cyclesCompleted: currentMonth.value
    };
  });

  /**
   * Determine exact share installment due for a specific month
   */
  const determineShareDue = (share, monthNumber = currentMonth.value, chitti = activeChitti.value) => {
    if (!chitti || !share) return 0;
    const isDrawn = share.Month_Drawn !== null && share.Month_Drawn < monthNumber;
    return isDrawn ? Number(chitti.Drawn_Due) : Number(chitti.Undrawn_Due);
  };

  /**
   * Inline Draw Winner Assignment
   */
  const updateShareDrawStatus = ({ shareId, isDrawn, winningMonth }) => {
    if (!activeChitti.value) return;
    const cid = activeChitti.value.Chitti_ID;
    const shareList = sharesMap.value[cid];
    if (!shareList) return;

    const share = shareList.find((s) => s.Share_ID === shareId);
    if (!share) return;

    share.Draw_Status = isDrawn ? 'Drawn' : 'Undrawn';
    share.Month_Drawn = isDrawn ? (winningMonth || currentMonth.value) : null;

    // Dynamically recalculate dues for all subsequent transactions of this share
    const allTxns = transactionsMap.value[cid] || [];
    allTxns.forEach((t) => {
      if (t.Share_ID === shareId) {
        const isDrawnAtM = share.Month_Drawn !== null && share.Month_Drawn < t.Month_Number;
        t.Draw_Status = isDrawnAtM ? 'Drawn' : 'Undrawn';
        t.Amount_Due = isDrawnAtM ? Number(activeChitti.value.Drawn_Due) : Number(activeChitti.value.Undrawn_Due);
        t.Pending_Dues = Math.max(0, t.Amount_Due - Number(t.Amount_Paid || 0));
        t.Payment_Status = t.Pending_Dues === 0 ? 'Verified' : (Number(t.Amount_Paid || 0) > 0 ? 'Partial' : 'Pending');
      }
    });

    saveStores();
    loadGroupDetails(activeChitti.value, currentMonth.value);
  };

  /**
   * Records a payment with Smart Over/Under settlement & Advance Credit deposit
   */
  const recordPayment = ({
    shareId,
    monthNumber,
    amount,
    paymentMode = 'UPI',
    entryType = 'Credit',
    paymentRef = ''
  }) => {
    if (!activeChitti.value) return;
    const cid = activeChitti.value.Chitti_ID;
    const allTxns = transactionsMap.value[cid] || [];
    const currentShares = sharesMap.value[cid] || [];

    const share = currentShares.find((s) => s.Share_ID === shareId);
    const targetMonth = monthNumber || currentMonth.value;

    let txn = allTxns.find(
      (t) => t.Share_ID === shareId && t.Month_Number === targetMonth
    );

    if (!txn) {
      // Spawn on the fly if needed
      spawnMonthCycleIfNeeded(activeChitti.value, targetMonth);
      txn = (transactionsMap.value[cid] || []).find(
        (t) => t.Share_ID === shareId && t.Month_Number === targetMonth
      );
    }

    if (!txn) throw new Error('Transaction record could not be found or spawned');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid positive payment amount');
    }

    const dueAmount = Number(txn.Amount_Due || 0);

    if (entryType === 'Credit') {
      const currentPaid = Number(txn.Amount_Paid || 0);
      const totalPaidAttempt = currentPaid + numAmount;

      if (totalPaidAttempt > dueAmount) {
        // Excess payment -> credit excess to share.Advance_Credit
        const excess = totalPaidAttempt - dueAmount;
        txn.Amount_Paid = dueAmount;
        txn.Pending_Dues = 0;
        txn.Payment_Status = 'Verified';

        if (share) {
          share.Advance_Credit = Number(share.Advance_Credit || 0) + excess;
        }
      } else {
        txn.Amount_Paid = totalPaidAttempt;
        txn.Pending_Dues = Math.max(0, dueAmount - txn.Amount_Paid);
        txn.Payment_Status = txn.Pending_Dues === 0 ? 'Verified' : 'Partial';
      }
    } else if (entryType === 'Debit') {
      txn.Amount_Paid = Math.max(0, Number(txn.Amount_Paid || 0) - numAmount);
      txn.Pending_Dues = Math.max(0, dueAmount - txn.Amount_Paid);
      txn.Payment_Status = txn.Amount_Paid === 0 ? 'Pending' : (txn.Pending_Dues === 0 ? 'Verified' : 'Partial');
    }

    txn.Payment_Mode = paymentMode;
    txn.Payment_Date = new Date().toISOString().split('T')[0];
    txn.Payment_Ref = paymentRef || `TXN-${Date.now().toString().slice(-6)}`;
    txn.Entry_Type = entryType;

    saveStores();
    loadGroupDetails(activeChitti.value, currentMonth.value);
    return { txn, share };
  };

  /**
   * Updates single-line member contact info (Member Name & Phone Number)
   */
  const updateMemberContact = ({ shareId, memberName, phone }) => {
    if (!activeChitti.value) return;
    const cid = activeChitti.value.Chitti_ID;
    const shareList = sharesMap.value[cid] || [];
    const share = shareList.find((s) => s.Share_ID === shareId);
    if (!share) return;

    if (memberName) share.Member_Name = memberName.trim();
    if (phone) {
      share.Phone = phone.trim();
      share.Phone_Number = phone.trim();
    }

    saveStores();
    loadGroupDetails(activeChitti.value, currentMonth.value);
  };

  /**
   * Get 20-month historical statement for an individual share
   */
  const getShareStatement = (shareId) => {
    if (!activeChitti.value) return [];
    const cid = activeChitti.value.Chitti_ID;
    const allTxns = transactionsMap.value[cid] || [];
    return allTxns
      .filter((t) => t.Share_ID === shareId)
      .sort((a, b) => a.Month_Number - b.Month_Number);
  };

  return {
    activeChitti,
    currentMonth,
    shares,
    transactions,
    isLoading,
    error,
    monthMetrics,
    masterMatrix,
    portfolioSummary,
    loadGroupDetails,
    determineShareDue,
    updateShareDrawStatus,
    recordPayment,
    updateMemberContact,
    getShareStatement
  };
}
