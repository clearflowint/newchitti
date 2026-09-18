import { ref, computed } from 'vue';
import axios from 'axios';
import { sampleManager, sampleGroups } from './sampleWorkspace';
import { generateUnique6DigitId, registerAllocatedId, registerAllocatedIds } from '../utils/idGenerator';

const STORAGE_KEY_GROUPS = 'clearflow_manager_groups_v2';
const STORAGE_KEY_MANAGER = 'clearflow_manager_user_v2';
const STORAGE_SHARES_KEY = 'clearflow_shares_store_v2';
const STORAGE_KEY_CUSTOMER_TYPE = 'clearflow_customer_type_v2';

const manager = ref(null);
const groups = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isSampleWorkspace = ref(false);
const customerType = ref(localStorage.getItem(STORAGE_KEY_CUSTOMER_TYPE) || 'existing');

const isNewCustomer = computed(() => {
  return customerType.value === 'new' || (!groups.value || groups.value.length === 0);
});

const isExistingCustomer = computed(() => {
  return !isNewCustomer.value && Boolean(groups.value && groups.value.length > 0);
});

const setCustomerType = (type) => {
  customerType.value = type;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMER_TYPE, type);
  } catch (e) {}
};

const loadPersistedData = () => {
  try {
    const savedMgr = localStorage.getItem(STORAGE_KEY_MANAGER);
    if (savedMgr) {
      manager.value = JSON.parse(savedMgr);
    }
    const savedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (savedGroups) {
      groups.value = JSON.parse(savedGroups);
    }
  } catch (e) {
    console.warn('Failed to parse localStorage data:', e);
  }

  if (!manager.value) {
    manager.value = { ...sampleManager };
  }
  if (!groups.value || groups.value.length === 0) {
    groups.value = JSON.parse(JSON.stringify(sampleGroups));
    isSampleWorkspace.value = true;
  }
};

loadPersistedData();

const persistGroups = () => {
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups.value));
  } catch (e) {
    console.warn('Failed to persist groups:', e);
  }
};

export function useManagerWorkspace() {
  const fetchWorkspace = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const meRes = await axios.get('/api/auth/me', { timeout: 1500 });
      if (meRes?.data) {
        manager.value = meRes.data;
        isSampleWorkspace.value = false;
      }
      const chittisRes = await axios.get('/api/chittis', { timeout: 1500 });
      if (Array.isArray(chittisRes?.data) && chittisRes.data.length > 0) {
        groups.value = chittisRes.data;
        isSampleWorkspace.value = false;
        persistGroups();
      }
    } catch (err) {
      if (!groups.value || groups.value.length === 0) {
        groups.value = JSON.parse(JSON.stringify(sampleGroups));
      }
      if (!manager.value) {
        manager.value = { ...sampleManager };
      }
      isSampleWorkspace.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  const addGroup = (newGroup) => {
    const S = Number(newGroup.Total_Members || newGroup.Total_Shares || 20);
    const M = Number(newGroup.Total_Months || 20);
    const C = Number(newGroup.Monthly_Commission || 4000);
    const D_undrawn = Number(newGroup.Undrawn_Due || 5000);
    const D_drawn = Number(newGroup.Drawn_Due || 6000);

    if (D_drawn < D_undrawn) {
      throw new Error('Drawn Due cannot be less than Undrawn Due');
    }

    const cid = String(newGroup.Chitti_ID || generateUnique6DigitId()).trim();
    registerAllocatedId(cid);

    const created = {
      Chitti_ID: cid,
      Manager_ID: manager.value?.Manager_ID || '840192',
      Chitti_Name: newGroup.Chitti_Name || 'New Chitti Group',
      Rule_Template: newGroup.Rule_Template || 'Incremental Model V1',
      Total_Members: S,
      Total_Shares: S,
      Total_Months: M,
      Current_Month: 1,
      Monthly_Commission: C,
      Drawn_Due: D_drawn,
      Undrawn_Due: D_undrawn,
      Cycle_Anchor_Day: newGroup.Cycle_Anchor_Day || '10th to 10th',
      Start_Date: newGroup.Start_Date || new Date().toISOString().split('T')[0],
      Status: 'Active',
      Is_Sample: false
    };

    // If custom members list is provided, persist it directly to sharesMap storage
    if (Array.isArray(newGroup.members) && newGroup.members.length > 0) {
      try {
        let sharesStore = {};
        const saved = localStorage.getItem(STORAGE_SHARES_KEY);
        if (saved) {
          sharesStore = JSON.parse(saved);
        }
        const allocatedShareIds = [];
        sharesStore[cid] = newGroup.members.map((m, idx) => {
          const shareId = String(m.Share_ID || generateUnique6DigitId()).trim();
          allocatedShareIds.push(shareId);
          return {
            Share_ID: shareId,
            Share_Number: idx + 1,
            Chitti_ID: cid,
            Member_Name: m.Member_Name || `Member ${idx + 1}`,
            Phone_Number: m.Phone_Number || m.Phone || '+91 98000 00000',
            Phone: m.Phone_Number || m.Phone || '+91 98000 00000',
            Draw_Status: 'Undrawn',
            Month_Drawn: null,
            Advance_Credit: 0
          };
        });
        registerAllocatedIds(allocatedShareIds);
        localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(sharesStore));
      } catch (e) {
        console.warn('Failed to seed custom members to storage:', e);
      }
    }

    groups.value.unshift(created);
    isSampleWorkspace.value = false;
    setCustomerType('existing');
    persistGroups();
    return created;
  };

  const getGroupById = (chittiId) => {
    return groups.value.find((g) => g.Chitti_ID === chittiId) || null;
  };

  const deleteGroup = (chittiId) => {
    if (!chittiId) return false;
    const initialCount = groups.value.length;
    groups.value = groups.value.filter((g) => g.Chitti_ID !== chittiId);

    // Clean up stored shares and transactions for this chittiId
    try {
      const sharesRaw = localStorage.getItem(STORAGE_SHARES_KEY);
      if (sharesRaw) {
        const sharesStore = JSON.parse(sharesRaw);
        delete sharesStore[chittiId];
        localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(sharesStore));
      }
      const txnsRaw = localStorage.getItem('clearflow_txns_v2');
      if (txnsRaw) {
        const txnsStore = JSON.parse(txnsRaw);
        delete txnsStore[chittiId];
        localStorage.setItem('clearflow_txns_v2', JSON.stringify(txnsStore));
      }
    } catch (e) {
      console.warn('Failed to clean up shares/txns for deleted group', e);
    }

    if (groups.value.length === 0) {
      setCustomerType('new');
    }
    persistGroups();
    return groups.value.length < initialCount;
  };

  const resetToSample = () => {
    groups.value = JSON.parse(JSON.stringify(sampleGroups));
    manager.value = { ...sampleManager };
    isSampleWorkspace.value = true;
    setCustomerType('existing');
    localStorage.removeItem(STORAGE_KEY_GROUPS);
    localStorage.removeItem(STORAGE_KEY_MANAGER);
    localStorage.removeItem(STORAGE_SHARES_KEY);
    localStorage.removeItem('clearflow_txns_store_v2');
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY_MANAGER);
    localStorage.removeItem('clearflow_auth_token');
    localStorage.removeItem(STORAGE_KEY_CUSTOMER_TYPE);
    manager.value = null;
  };

  return {
    manager,
    groups,
    isLoading,
    error,
    isSampleWorkspace,
    customerType,
    isNewCustomer,
    isExistingCustomer,
    setCustomerType,
    fetchWorkspace,
    addGroup,
    deleteGroup,
    getGroupById,
    resetToSample,
    signOut
  };
}
