import { ref, computed } from 'vue';
import axios from 'axios';
import { sampleManager, sampleGroups } from './sampleWorkspace';

const STORAGE_KEY_GROUPS = 'clearflow_manager_groups_v2';
const STORAGE_KEY_MANAGER = 'clearflow_manager_user_v2';
const STORAGE_SHARES_KEY = 'clearflow_shares_store_v2';

const manager = ref(null);
const groups = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isSampleWorkspace = ref(false);

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

    const cid = newGroup.Chitti_ID || `CHT-${Date.now().toString().slice(-4)}`;

    const created = {
      Chitti_ID: cid,
      Manager_ID: manager.value?.Manager_ID || 'MGR-001',
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
        sharesStore[cid] = newGroup.members.map((m, idx) => ({
          Share_ID: m.Share_ID || `${cid}-S${String(idx + 1).padStart(2, '0')}`,
          Share_Number: idx + 1,
          Chitti_ID: cid,
          Member_Name: m.Member_Name || `Member ${idx + 1}`,
          Phone_Number: m.Phone_Number || m.Phone || '+91 98000 00000',
          Phone: m.Phone_Number || m.Phone || '+91 98000 00000',
          Draw_Status: 'Undrawn',
          Month_Drawn: null,
          Advance_Credit: 0
        }));
        localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(sharesStore));
      } catch (e) {
        console.warn('Failed to seed custom members to storage:', e);
      }
    }

    groups.value.unshift(created);
    isSampleWorkspace.value = false;
    persistGroups();
    return created;
  };

  const getGroupById = (chittiId) => {
    return groups.value.find((g) => g.Chitti_ID === chittiId) || null;
  };

  const resetToSample = () => {
    groups.value = JSON.parse(JSON.stringify(sampleGroups));
    manager.value = { ...sampleManager };
    isSampleWorkspace.value = true;
    localStorage.removeItem(STORAGE_KEY_GROUPS);
    localStorage.removeItem(STORAGE_KEY_MANAGER);
    localStorage.removeItem(STORAGE_SHARES_KEY);
    localStorage.removeItem('clearflow_txns_store_v2');
  };

  return {
    manager,
    groups,
    isLoading,
    error,
    isSampleWorkspace,
    fetchWorkspace,
    addGroup,
    getGroupById,
    resetToSample
  };
}
