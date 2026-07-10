import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store'

// Lazy-loaded routes: each view is a separate chunk, loaded on first navigation
const Login = () => import('@/views/Login.vue')
const Logout = () => import('@/views/Logout.vue')
const Publications = () => import('@/views/Publications.vue')
const AppDetails = () => import('@/views/AppDetails.vue')
const Contributors = () => import('@/views/Contributors.vue')
const Publish = () => import('@/views/Publish.vue')
const Stats = () => import('@/views/Stats.vue')
const MyApps = () => import('@/views/MyApps.vue')
const MyReviews = () => import('@/views/MyReviews.vue')
const MyModerations = () => import('@/views/MyModerations.vue')
const Admin = () => import('@/views/Admin.vue')
const Settings = () => import('@/views/Settings.vue')

const routes = [
  {
    path: '/',
    redirect: '/store/publications'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    redirect: { path: '/login', query: { mode: 'signup' } }
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout
  },
  {
    path: '/store/publications',
    name: 'Publications',
    component: Publications,
    props: true
  },
  {
    path: '/store/publications/details',
    name: 'Details',
    component: AppDetails
  },
  {
    path: '/store/contributors',
    name: 'Contributors',
    component: Contributors,
    props: true
  },
  {
    path: '/store/publish',
    name: 'Publish',
    component: Publish,
    meta: { requiresAuth: true }
  },
  {
    path: '/store/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/dashboard/apps',
    name: 'MyApps',
    component: MyApps,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/reviews',
    name: 'MyReviews',
    component: MyReviews,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/moderations',
    name: 'MyModerations',
    component: MyModerations,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// Route guard: protect authenticated routes and admin-only routes using platform JWT and roles.
router.beforeEach((to, _from, next) => {
  const jwt = store.state.jwt
  const roles = store.state.roles ?? []

  if (to.meta.requiresAdmin && !roles.includes('admin')) {
    return next('/')
  }

  if (to.meta.requiresAuth && !jwt) {
    return next({
      path: '/login',
      query: { redirect_uri: `${window.location.pathname}#${to.fullPath}` }
    })
  }

  next()
})

export default router
