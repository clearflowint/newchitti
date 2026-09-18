import { ref, computed } from 'vue';

const STORAGE_KEY = 'clearflow_auth_user';

export const PRESET_PERSONAS = [
  {
    id: 'mgr-01',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@clearflow.app',
    phone: '+91 98201 23456',
    role: 'manager',
    shareId: '1',
    avatar: 'RS',
    designation: 'Chit Foreman & Manager'
  },
  {
    id: 'mbr-04',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98450 67890',
    role: 'member',
    shareId: '4',
    avatar: 'PP',
    designation: 'Member (Share #04 - Active Bidder)'
  },
  {
    id: 'mbr-12',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98765 43210',
    role: 'member',
    shareId: '12',
    avatar: 'VS',
    designation: 'Member (Share #12 - Non-Prized)'
  },
  {
    id: 'mbr-02',
    name: 'Ramesh Gupta',
    email: 'ramesh.gupta@example.com',
    phone: '+91 98111 22334',
    role: 'member',
    shareId: '2',
    avatar: 'RG',
    designation: 'Member (Share #02 - Prized Month 2)'
  }
];

const loadInitialUser = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse auth user', e);
  }
  return PRESET_PERSONAS[0]; // Default to Rajesh Sharma (Manager)
};

const currentUser = ref(loadInitialUser());

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const isManager = computed(() => currentUser.value?.role === 'manager');
  const activeShareId = computed(() => currentUser.value?.shareId || '4');

  const setUser = (user) => {
    currentUser.value = user;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const switchPersona = (personaId) => {
    const found = PRESET_PERSONAS.find((p) => p.id === personaId);
    if (found) {
      setUser(found);
    }
  };

  const loginAsManager = () => {
    setUser(PRESET_PERSONAS[0]);
  };

  const loginAsMember = (shareId = '4') => {
    const persona = PRESET_PERSONAS.find((p) => p.shareId === String(shareId)) || PRESET_PERSONAS[1];
    setUser(persona);
  };

  const logout = () => {
    setUser(PRESET_PERSONAS[0]);
  };

  return {
    currentUser,
    isAuthenticated,
    isManager,
    activeShareId,
    personas: PRESET_PERSONAS,
    setUser,
    switchPersona,
    loginAsManager,
    loginAsMember,
    logout
  };
}
