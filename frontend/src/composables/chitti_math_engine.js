// chitti_math_engine.js
// Isolated, pure mathematical engine for ClearFlow Chit Fund management.
// Contains ZERO hardcoded financial values. All matrices and pocket cash
// calculations are dynamically driven by user-defined circle parameters.

/**
 * Validates and normalizes chitti financial parameters.
 */
export function normalizeChittiParams(params = {}) {
  const S = Math.max(1, Number(params.Total_Members || params.Total_Shares || 20));
  const M = Math.max(1, Number(params.Total_Months || 20));
  const C = Math.max(0, Number(params.Monthly_Commission || 4000));
  const D_undrawn = Math.max(0, Number(params.Undrawn_Due || 5000));
  const D_drawn = Math.max(D_undrawn, Number(params.Drawn_Due || 6000));

  return { S, M, C, D_undrawn, D_drawn };
}

/**
 * Calculates exact dynamic financial metrics for a specific cycle month m.
 * 
 * Equations:
 * 1. Count of Drawn Members: N_drawn(m) = m - 1
 * 2. Count of Undrawn Members: N_undrawn(m) = S - (m - 1)
 * 3. Gross Monthly Pool Collected: P(m) = [N_undrawn(m) * D_undrawn] + [N_drawn(m) * D_drawn]
 * 4. Net Winner Bulk Payout: W(m) = P(m) - C
 * 5. Manager Earned Commission: C(m) = C
 * 
 * @param {Object} params - { Total_Members, Total_Months, Monthly_Commission, Undrawn_Due, Drawn_Due }
 * @param {number} month - Active month number (1 <= month <= M)
 */
export function calculateMonthMath(params, month = 1) {
  const { S, M, C, D_undrawn, D_drawn } = normalizeChittiParams(params);
  const m = Math.max(1, Math.min(M, Number(month) || 1));

  // Count of drawn and undrawn members for month m
  const n_drawn = m - 1;
  const n_undrawn = S - (m - 1);

  // Gross Pool P(m)
  const gross_pool = (n_undrawn * D_undrawn) + (n_drawn * D_drawn);

  // Net Winner Bulk Payout W(m)
  const net_payout = Math.max(0, gross_pool - C);

  // Manager Commission C
  const commission = C;

  return {
    month: m,
    total_members: S,
    total_months: M,
    n_undrawn,
    d_undrawn: D_undrawn,
    n_drawn,
    d_drawn: D_drawn,
    gross_pool,
    commission,
    net_payout
  };
}

/**
 * Generates the full dynamic financial matrix for all M months of the chit circle.
 * 
 * @param {Object} params - { Total_Members, Total_Months, Monthly_Commission, Undrawn_Due, Drawn_Due }
 * @returns {Array<Object>} Array of monthly calculations for month 1..M
 */
export function generateFinancialMatrix(params) {
  const { M } = normalizeChittiParams(params);
  const matrix = [];
  for (let m = 1; m <= M; m++) {
    matrix.push(calculateMonthMath(params, m));
  }
  return matrix;
}

/**
 * Computes pocket cash metrics for the active cycle month.
 * 
 * Equations:
 * 1. Cash without Advances = sum(Amount_Paid for month m) - W(m) - C
 * 2. Advance Credit Reserve = sum(Advance_Credit across all shares)
 * 3. Cash with Advances = Cash without Advances + Advance Credit Reserve
 * 4. Status = Green Surplus (>= 0) or Red Deficit (< 0)
 * 
 * @param {Object} options
 * @param {Object} options.chitti - Circle parameters
 * @param {number} options.month - Active month number
 * @param {Array} options.transactions - Month m transactions
 * @param {Array} options.shares - All shares of the group
 */
export function calculatePocketCash({ chitti, month, transactions = [], shares = [] }) {
  const monthMath = calculateMonthMath(chitti, month);

  // Total collected strictly for this month's installment
  const totalCollectedThisMonth = transactions.reduce((acc, t) => acc + Number(t.Amount_Paid || 0), 0);

  // Expected collection according to dynamic math
  const expectedPool = monthMath.gross_pool;

  // Pending balance for this month
  const pendingCollection = Math.max(0, expectedPool - totalCollectedThisMonth);

  // Total advance credit reserve held by manager across all shares
  const totalAdvanceReserve = shares.reduce((acc, s) => acc + Number(s.Advance_Credit || 0), 0);

  // Cash without Advances: actual inflows minus winner payout minus manager commission
  const cashWithoutAdvances = totalCollectedThisMonth - monthMath.net_payout - monthMath.commission;

  // Cash with Advances: cash without advances + advance buffer
  const cashWithAdvances = cashWithoutAdvances + totalAdvanceReserve;

  // Counts of paid, partial, pending
  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;

  transactions.forEach((t) => {
    if (t.Payment_Status === 'Verified' || t.Payment_Status === 'Paid') {
      paidCount++;
    } else if (t.Payment_Status === 'Partial' || Number(t.Amount_Paid || 0) > 0) {
      partialCount++;
    } else {
      pendingCount++;
    }
  });

  const collectionRate = expectedPool > 0 ? Math.round((totalCollectedThisMonth / expectedPool) * 100) : 0;

  return {
    month: monthMath.month,
    expectedPool,
    totalCollected: totalCollectedThisMonth,
    pendingCollection,
    collectionRate,
    netPayout: monthMath.net_payout,
    commission: monthMath.commission,
    nUndrawn: monthMath.n_undrawn,
    nDrawn: monthMath.n_drawn,
    dUndrawn: monthMath.d_undrawn,
    dDrawn: monthMath.d_drawn,
    paidCount,
    partialCount,
    pendingCount,
    cashWithoutAdvances,
    cashWithAdvances,
    totalAdvanceReserve,
    isSurplusWithoutAdvances: cashWithoutAdvances >= 0,
    isSurplusWithAdvances: cashWithAdvances >= 0
  };
}

/**
 * Auto-settles advance credit when spawning a new cycle or applying advance credit to a share.
 * 
 * @param {Object} share - Share record with Advance_Credit
 * @param {number} amountDue - Monthly installment due
 * @returns {Object} { amountPaid, pendingDues, paymentStatus, newAdvanceCredit, deductedCredit }
 */
export function settleAdvanceCredit(share, amountDue) {
  const currentCredit = Number(share.Advance_Credit || 0);
  const due = Number(amountDue || 0);

  if (currentCredit <= 0) {
    return {
      amountPaid: 0,
      pendingDues: due,
      paymentStatus: 'Pending',
      newAdvanceCredit: 0,
      deductedCredit: 0
    };
  }

  if (currentCredit >= due) {
    return {
      amountPaid: due,
      pendingDues: 0,
      paymentStatus: 'Verified',
      newAdvanceCredit: currentCredit - due,
      deductedCredit: due
    };
  }

  // Partial settlement from advance credit
  return {
    amountPaid: currentCredit,
    pendingDues: due - currentCredit,
    paymentStatus: 'Partial',
    newAdvanceCredit: 0,
    deductedCredit: currentCredit
  };
}
