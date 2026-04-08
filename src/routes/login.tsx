import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toggleAuth } from "./_auth/route";

const Login = () => {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();

  return (
    <div style={{ padding: 32 }}>
      <h1>Login</h1>
      <button
        type="button"
        onClick={() => {
          toggleAuth();
          navigate({ to: redirectTo ?? "/dashboard" });
        }}
      >
        Log in
      </button>
    </div>
  );
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  component: Login,
});
