const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("layouts/LoginLayout.vue"),
    children: [{ path: "/", component: () => import("src/pages/LogIn.vue") }],
    meta: { authRequired: false },
  },
  {
    path: "/fa",
    component: () => import("layouts/LoginLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/BootStrap.vue") },
    ],
    meta: { authRequired: false },
  },
  {
    path: "/medic",
    name: "medic",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "/medic", component: () => import("src/pages/MedicDash.vue") },
    ],
    meta: { authRequired: true },
  },
  {
    path: "/authvidaas",
    name: "vidaas",
    component: () => import("layouts/LoginLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/AuthVidaas.vue"),
      },
    ],
    meta: { authRequired: false },
  },
  {
    path: "/client",
    name: "client",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "/client", component: () => import("src/pages/ClientDash.vue") },
    ],
    meta: { authRequired: true },
  },
  {
    path: "/project",
    name: "project",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/project",
        component: () => import("src/pages/ProjectDash.vue"),
      },
    ],
    meta: { authRequired: true },
  },
  {
    path: "/requester",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/requester",
        component: () => import("src/pages/RequesterDash.vue"),
      },
    ],
    meta: { authRequired: true },
  },
  {
    path: "/node",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/NodeDash.vue") }],
    meta: { authRequired: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
