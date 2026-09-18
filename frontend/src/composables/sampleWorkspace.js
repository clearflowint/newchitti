// sampleWorkspace.js - Canonical sample data for ClearFlow Chit Fund Workspace
// Aligned with ClearFlow Blueprint Specification:
// Standard Parameters: S=20, M=20, C=4000, D_undrawn=5000, D_drawn=6000

export const sampleManager = {
  Manager_ID: 'MGR-001',
  Name: 'Rajesh Sharma',
  Email: 'rajesh.sharma@clearflow.app',
  Phone: '+91 98450 12345',
  Role: 'Foreman'
};

export const sampleGroups = [
  {
    Chitti_ID: 'CHT-2026-A',
    Manager_ID: 'MGR-001',
    Chitti_Name: 'Swarna Chitti 2026 (Group A)',
    Rule_Template: 'Incremental Model V1',
    Total_Members: 20,
    Total_Shares: 20,
    Total_Months: 20,
    Current_Month: 5,
    Monthly_Commission: 4000,
    Drawn_Due: 6000,
    Undrawn_Due: 5000,
    Cycle_Anchor_Day: '10th to 10th',
    Start_Date: '2026-05-01',
    Status: 'Active',
    Is_Sample: true
  },
  {
    Chitti_ID: 'CHT-2026-B',
    Manager_ID: 'MGR-001',
    Chitti_Name: 'Navkar Diamond Chitti (Group B)',
    Rule_Template: 'Incremental Model V1',
    Total_Members: 20,
    Total_Shares: 20,
    Total_Months: 20,
    Current_Month: 2,
    Monthly_Commission: 5000,
    Drawn_Due: 12000,
    Undrawn_Due: 10000,
    Cycle_Anchor_Day: '15th to 15th',
    Start_Date: '2026-08-01',
    Status: 'Active',
    Is_Sample: true
  }
];

export const generateSampleShares = (chittiId) => {
  const members = [
    { name: 'Rajesh Sharma (Foreman)', phone: '+91 98450 12345', drawnMonth: 1, advanceCredit: 0 },
    { name: 'Ramesh Gupta', phone: '+91 98451 23456', drawnMonth: 2, advanceCredit: 0 },
    { name: 'Sunita Rao', phone: '+91 98452 34567', drawnMonth: 3, advanceCredit: 5000 },
    { name: 'Priya Patel', phone: '+91 98453 45678', drawnMonth: 4, advanceCredit: 0 },
    { name: 'Amit Verma', phone: '+91 98454 56789', drawnMonth: null, advanceCredit: 10000 },
    { name: 'Deepa Joshi', phone: '+91 98455 67890', drawnMonth: null, advanceCredit: 0 },
    { name: 'Suresh Kumar', phone: '+91 98456 78901', drawnMonth: null, advanceCredit: 0 },
    { name: 'Kavita Reddy', phone: '+91 98457 89012', drawnMonth: null, advanceCredit: 0 },
    { name: 'Manoj Agarwal', phone: '+91 98458 90123', drawnMonth: null, advanceCredit: 0 },
    { name: 'Neha Chawla', phone: '+91 98459 01234', drawnMonth: null, advanceCredit: 0 },
    { name: 'Rohit Mehra', phone: '+91 98460 12345', drawnMonth: null, advanceCredit: 0 },
    { name: 'Vikram Singh', phone: '+91 98461 23456', drawnMonth: null, advanceCredit: 0 },
    { name: 'Geeta Iyer', phone: '+91 98462 34567', drawnMonth: null, advanceCredit: 0 },
    { name: 'Harish Nair', phone: '+91 98463 45678', drawnMonth: null, advanceCredit: 0 },
    { name: 'Pooja Shah', phone: '+91 98464 56789', drawnMonth: null, advanceCredit: 0 },
    { name: 'Sanjay Bhatia', phone: '+91 98465 67890', drawnMonth: null, advanceCredit: 0 },
    { name: 'Meenakshi Pillai', phone: '+91 98466 78901', drawnMonth: null, advanceCredit: 0 },
    { name: 'Tarun Kapoor', phone: '+91 98467 89012', drawnMonth: null, advanceCredit: 0 },
    { name: 'Swati Jain', phone: '+91 98468 90123', drawnMonth: null, advanceCredit: 0 },
    { name: 'Dinesh Yadav', phone: '+91 98469 01234', drawnMonth: null, advanceCredit: 0 }
  ];

  return members.map((m, idx) => {
    const shareNum = String(idx + 1).padStart(2, '0');
    // In Month 5, shares drawn in months 1..4 are already drawn
    const isDrawn = m.drawnMonth !== null && m.drawnMonth < 5;
    return {
      Share_ID: `${chittiId}-S${shareNum}`,
      Share_Number: idx + 1,
      Chitti_ID: chittiId,
      Member_Name: m.name,
      Phone_Number: m.phone,
      Phone: m.phone,
      Draw_Status: isDrawn ? 'Drawn' : 'Undrawn',
      Month_Drawn: m.drawnMonth,
      Advance_Credit: m.advanceCredit || 0
    };
  });
};

export const generateSampleTransactions = (chitti, share) => {
  const transactions = [];
  const startYear = 2026;
  const startMonth = 5;
  const currentMonth = Number(chitti.Current_Month || 5);

  // According to Section 6: On-Demand Cycle Spawning
  // Spawns historical months up to currentMonth
  for (let m = 1; m <= currentMonth; m++) {
    // Was this share drawn on or before month m?
    const isDrawnAtMonth = share.Month_Drawn !== null && share.Month_Drawn < m;
    const amountDue = isDrawnAtMonth ? Number(chitti.Drawn_Due) : Number(chitti.Undrawn_Due);

    const dt = new Date(startYear, startMonth - 1 + (m - 1), 10);
    const monthLabel = dt.toLocaleString('default', { month: 'short', year: 'numeric' });

    let amountPaid = 0;
    let paymentStatus = 'Pending';
    let paymentMode = 'UPI';
    let paymentDate = null;
    let paymentRef = null;

    if (m < currentMonth) {
      // Historical months: settled
      amountPaid = amountDue;
      paymentStatus = 'Verified';
      paymentDate = `${startYear}-${String(startMonth + m - 1).padStart(2, '0')}-10`;
      paymentRef = `TXN-${share.Share_ID}-M${m}`;
    } else if (m === currentMonth) {
      // Current active month
      if (share.Share_Number <= 14) {
        amountPaid = amountDue;
        paymentStatus = 'Verified';
        paymentDate = `2026-09-08`;
        paymentRef = `TXN-${share.Share_ID}-M${m}`;
      } else if (share.Share_Number === 15) {
        // Partial payment example
        amountPaid = Math.round(amountDue / 2);
        paymentStatus = 'Partial';
        paymentDate = `2026-09-09`;
        paymentRef = `TXN-${share.Share_ID}-M${m}`;
      } else {
        amountPaid = 0;
        paymentStatus = 'Pending';
      }
    }

    transactions.push({
      Trans_ID: `${chitti.Chitti_ID}_M${m}_${share.Share_ID}`,
      Share_ID: share.Share_ID,
      Chitti_ID: chitti.Chitti_ID,
      Month_Number: m,
      Month_Label: monthLabel,
      Draw_Status: isDrawnAtMonth ? 'Drawn' : 'Undrawn',
      Amount_Due: amountDue,
      Amount_Paid: amountPaid,
      Pending_Dues: Math.max(0, amountDue - amountPaid),
      Payment_Status: paymentStatus,
      Payment_Mode: paymentMode,
      Payment_Date: paymentDate,
      Payment_Ref: paymentRef,
      Entry_Type: 'Credit'
    });
  }

  return transactions;
};
