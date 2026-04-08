import { queryOptions } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
} from "@tanstack/react-router";
import { Suspense } from "react";

const userOptions = queryOptions({
  queryKey: ["user"],
  queryFn: () =>
    new Promise<{ id: number; name: string }>((resolve) =>
      setTimeout(() => resolve({ id: 1, name: "Test User" }), 200),
    ),
});

/**
 * Sidebar that subscribes to all matches (no selector) — mirrors the
 * real project's `useRouteByMatches` which calls `useMatches()` without
 * a selector to find the deepest match and resolve the active route title.
 */
const Sidebar = () => {
  const matches = useMatches();
  const deepest = matches[matches.length - 1];

  return (
    <nav style={{ padding: 16, borderRight: "1px solid #ccc", width: 200 }}>
      <strong>Sidebar</strong>
      <p>Active: {deepest?.fullPath}</p>
    </nav>
  );
};

const AuthLayout = () => (
  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
    <Sidebar />
    <main style={{ padding: 16 }}>
      <Suspense fallback={<p>Loading…</p>}>
        <Outlet />
      </Suspense>
    </main>
  </div>
);

let isLoggedIn = false;
export const toggleAuth = () => {
  isLoggedIn = !isLoggedIn;
};

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    if (!isLoggedIn) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
  },
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(userOptions);
  },
  component: AuthLayout,
  head: ({ match }) => ({
    meta: [{ title: `${match.fullPath} - App` }],
  }),
});
