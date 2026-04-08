import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";

const RootComponent = () => (
  <>
    <HeadContent />
    <Outlet />
  </>
);

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  head: () => ({
    meta: [{ title: "App" }],
  }),
});
