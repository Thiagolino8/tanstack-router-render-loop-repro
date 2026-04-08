import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const dashboardOptions = {
  queryKey: ["dashboard-stats"],
  queryFn: () =>
    new Promise<{ visits: number }>((resolve) =>
      setTimeout(() => resolve({ visits: 42 }), 150),
    ),
};

const Dashboard = () => {
  const { data } = useSuspenseQuery(dashboardOptions);
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Visits: {data.visits}</p>
    </div>
  );
};

export const Route = createFileRoute("/_auth/dashboard")({
  component: Dashboard,
  head: ({ match }) => ({
    meta: [{ title: `Dashboard ${match.fullPath} - App` }],
  }),
});
