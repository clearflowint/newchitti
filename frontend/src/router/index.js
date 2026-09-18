import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/groups/CHT-2026-A'
  },
  {
    path: '/home',
    redirect: '/groups/CHT-2026-A'
  },
  {
    path: '/groups/:chittiId',
    name: 'GroupDetail',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../views/OnboardingView.vue')
  },
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('../views/DemoView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/summary',
    redirect: '/home'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
