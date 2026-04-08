import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  head: () => ({
    meta: [{ title: "App" }],
  }),
});
