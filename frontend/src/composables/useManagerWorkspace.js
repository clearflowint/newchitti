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
  const getTenantHeaders = () => {
    const tid = manager.value?.Tenant_ID || `TNT-${manager.value?.Manager_ID || '840192'}`;
    return { 'x-tenant-id': tid };
  };

  const fetchWorkspace = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const headers = getTenantHeaders();
      const chittisRes = await axios.get('/api/chittis', { headers, timeout: 2500 });
      const fetchedList = chittisRes.data?.groups || (Array.isArray(chittisRes.data) ? chittisRes.data : []);

      if (fetchedList.length > 0) {
        groups.value = fetchedList;
        isSampleWorkspace.value = false;
        persistGroups();
      }
    } catch (err) {
      console.warn('[Workspace] Backend fetch fallback to local cache:', err.message);
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

  const addGroup = async (newGroup) => {
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
      Cycle_Anchor_Day: newGroup.Cycle_Anchor_Day || 10,
      Start_Date: newGroup.Start_Date || new Date().toISOString().split('T')[0],
      Status: 'Active',
      Is_Sample: false
    };

    // Prepare members payload
    const membersPayload = Array.isArray(newGroup.members) ? newGroup.members : [];

    // Optimistic UI insertion immediately
    groups.value.unshift(created);
    isSampleWorkspace.value = false;
    setCustomerType('existing');
    persistGroups();

    // Fire API call to backend
    try {
      const headers = getTenantHeaders();
      const resp = await axios.post(
        '/api/chittis',
        {
          ...created,
          members: membersPayload
        },
        { headers, timeout: 5000 }
      );

      if (resp.data?.group?.Global_ID) {
        created.Global_ID = resp.data.group.Global_ID;
      }
    } catch (err) {
      console.warn('[Workspace] API save warning, retained in local store:', err.message);
    }

    return created;
  };

  const getGroupById = (chittiId) => {
    return groups.value.find((g) => g.Chitti_ID === chittiId) || null;
  };

  const deleteGroup = async (chittiId) => {
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

    // Notify backend queue
    try {
      const headers = getTenantHeaders();
      await axios.delete(`/api/chittis/${chittiId}`, { headers, timeout: 2500 });
    } catch (e) {
      console.warn('[Workspace] Delete queue dispatch warning:', e.message);
    }

    return groups.value.length < initialCount;
  };

  const resetToSample = async () => {
    groups.value = JSON.parse(JSON.stringify(sampleGroups));
    manager.value = { ...sampleManager };
    isSampleWorkspace.value = true;
    setCustomerType('existing');
    localStorage.removeItem(STORAGE_KEY_GROUPS);
    localStorage.removeItem(STORAGE_KEY_MANAGER);
    localStorage.removeItem(STORAGE_SHARES_KEY);
    localStorage.removeItem('clearflow_txns_store_v2');

    try {
      const headers = getTenantHeaders();
      await axios.post('/api/sync/reset', {}, { headers, timeout: 2500 });
    } catch (e) {
      console.warn('[Workspace] Reset sync warning:', e.message);
    }
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
