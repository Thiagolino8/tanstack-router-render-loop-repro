# Render loop regression — @tanstack/react-router >= 1.168.0

Minimal reproduction of an infinite render loop introduced by the signal-based reactivity refactor (PR #6704, released in `@tanstack/react-router@1.168.0`).

## Environment

| Dependency | Version |
|---|---|
| `@tanstack/react-router` | **1.168.10** (bug) / **1.167.4** (works) |
| `@tanstack/react-query` | 5.96.2 |
| `react` | 19.2.4 |
| `vite` | 8.0.7 |

## How to reproduce

```bash
pnpm install
pnpm dev
```

Open the browser — the app will immediately enter an infinite render loop. The page either freezes, shows a blank screen, or shows `Maximum update depth exceeded` in the console.

### Confirm fix by downgrading

```bash
pnpm add @tanstack/react-router@1.167.4
pnpm dev
```

The app works normally on `1.167.4`.

## What triggers the loop

The combination of the following patterns causes the loop after the signal-based reactivity refactor:

1. **`HeadContent`** in the root route — subscribes to head meta from all matched routes
2. **`head()` on child routes** reading `match.fullPath` — becomes signal-reactive in 1.168.0
3. **`useMatches()` without a selector** — subscribes to the full `activeMatchesSnapshot` computed store, which rebuilds on every match store change
4. **`beforeLoad` with `throw redirect()`** — triggers navigation state changes that propagate through all computed stores
5. **`loader` calling `queryClient.ensureQueryData()`** (fire-and-forget) — causes match state updates during the loading phase
6. **React 19 `StrictMode`** — double-invokes effects, exacerbating timing issues with the new batch/flush mechanism
7. **`defaultStructuralSharing: true`** — `replaceEqualDeep` receives new array references from recomputed stores, failing to deduplicate
8. **`defaultViewTransition: true`** — view transition reads snapshot during pending state

### Signal propagation chain (simplified)

```
location store update
  → matchRouteReactivity recomputes (depends on location + status)
  → activeMatchesSnapshot recomputes (depends on matchesId + match stores)
  → useMatches() sees new reference → Sidebar re-renders
  → HeadContent sees new head() output → re-renders
  → Match component re-subscribes to match store
  → match store has pending loader → Suspense throws
  → Suspense fallback → re-triggers navigation
  → loop
```

## Project structure

```
src/
├── main.tsx                     # createRouter with structural sharing + view transitions
├── routes/
│   ├── __root.tsx               # HeadContent + root head()
│   ├── index.tsx                # Redirects / → /dashboard
│   ├── login.tsx                # Login page with search params
│   └── _auth/
│       ├── route.tsx            # Layout with beforeLoad redirect + loader + useMatches() sidebar
│       └── dashboard.tsx        # useSuspenseQuery + head()
```

## Expected behavior

The app should render without entering an infinite loop, same as `1.167.4`.

## Actual behavior

Infinite render loop starting from `1.168.0` onwards (tested up to `1.168.10`).
