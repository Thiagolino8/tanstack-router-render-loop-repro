# Render loop — `@tanstack/react-router` >= 1.168.0 + custom `useSyncExternalStoreWithSelector` shim

Minimal reproduction of an infinite render loop triggered by upgrading `@tanstack/react-router` from `1.167.x` to `>= 1.168.0`.

## Root cause

Starting from `1.168.0` (PR [#6704](https://github.com/TanStack/router/pull/6704)), `@tanstack/react-router` moved to signal-based reactivity via `@tanstack/react-store`, which internally uses `useSyncExternalStoreWithSelector` from `use-sync-external-store/shim/with-selector`.

Our project aliases `use-sync-external-store/shim` to a custom shim that re-exports React 19's native `useSyncExternalStore` (avoiding the polyfill). The `with-selector` portion of the shim has a subtle bug — it calls `setState` during render to track the previous value for equality comparison:

```js
// src/shim/with-selector/with-selector.js (buggy)
const selected = useSyncExternalStore(subscribe, getSelectedSnapshot);
const [state, setState] = useState(selected);
if (!isEqual?.(state, selected)) {
  setState(selected); // ← setState during render
}
return state;
```

When a store selector produces a **new reference** on every `getSnapshot()` call (which happens with the new computed atoms/stores in `@tanstack/react-store`), this creates an infinite loop:

1. Render → `getSelectedSnapshot()` returns new reference
2. `selected !== state` → `setState(selected)` during render
3. Re-render → `getSelectedSnapshot()` returns yet another new reference
4. `selected !== state` → `setState(selected)` again → **∞ loop**

On `1.167.x` this never triggered because the router did **not** use `@tanstack/react-store` / `useStore` — it subscribed to router state through a different mechanism that didn't go through `useSyncExternalStoreWithSelector`.

## Environment

| Dependency | Version |
|---|---|
| `@tanstack/react-router` | **1.168.10** (broken) / **1.167.4** (works) |
| `react` | 19.2.4 |
| `vite` | 8.0.7 |

## How to reproduce

```bash
pnpm install
pnpm dev
```

Open the browser — the app enters an infinite render loop (blank screen or `Maximum update depth exceeded`).

### Confirm fix by downgrading

```bash
pnpm add @tanstack/react-router@1.167.4
pnpm dev
```

Works normally.

### Alternative fix — remove the alias

Remove the `use-sync-external-store/shim` alias from `vite.config.ts`. The bundled polyfill from `use-sync-external-store` has a correct `useSyncExternalStoreWithSelector` implementation that caches selector results in refs instead of calling `setState` during render.

## Project structure

```
src/
├── main.tsx                 # Minimal router setup with StrictMode
├── shim/                    # Custom useSyncExternalStore shim (the bug)
│   ├── index.js
│   ├── with-selector.js
│   └── with-selector/
│       ├── index.js
│       └── with-selector.js # ← buggy useSyncExternalStoreWithSelector
├── routes/
│   ├── __root.tsx           # HeadContent + Outlet
│   └── index.tsx            # Simple home page
└── routeTree.gen.ts
```
