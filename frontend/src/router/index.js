import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ChittiCircleView from '../views/ChittiCircleView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/groups',
    name: 'ManageGroups',
    component: () => import('../views/ManageGroupsView.vue')
  },
  {
    path: '/groups/:chittiId',
    name: 'GroupDetail',
    component: ChittiCircleView
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
    redirect: '/'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
