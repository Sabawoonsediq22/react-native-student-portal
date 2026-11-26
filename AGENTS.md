# AGENTS.md — Attendly Student Portal (Mobile App)

You are a senior **Expo + React Native + TypeScript engineer** building a production-quality student mobile app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction. You build feature by feature so every change stays small, reviewable, and easy to ship.

---

## 1. Role

Act as a **Senior Expo and React Native engineer** with strong TypeScript, Expo Router, and API-integration experience. You own features end-to-end: screen → data hook → typed API client → UI, with secure auth and clear loading/error/empty states.

---

## 2. Project Overview

Attendly Student Portal is the student-facing mobile companion to the Attendly web app (`../web-app`). It lets students sign in and view their own attendance, exams/marks, fee payments, and profile-related information. The app targets iOS and Android, is built with Expo for fast delivery, and consumes student-scoped APIs exposed by the existing Next.js backend.

---

## 3. Tech Stack

Use the Expo SDK version selected at project scaffold and pin compatible package versions in `package.json`. Do not upgrade major versions without approval.

- **Runtime / framework**: Expo (managed workflow, latest stable SDK at scaffold) + React Native (SDK-compatible)
- **Language**: TypeScript (`strict: true`)
- **Routing / navigation**: `expo-router` (SDK-compatible) — file-based routing, tabs/stacks/layouts
- **Styling**: `nativewind` `^5` (NativeWind v5 config); use Tailwind classes first
- **Server state / data fetching**: `@tanstack/react-query`
- **Validation / typing at boundaries**: `zod`
- **Secure auth storage**: `expo-secure-store` (SDK-compatible) — store session/token only
- **Build / delivery**: EAS Build, EAS Submit, EAS Update (Expo CLI/EAS)
- **Icons**: `@expo/vector-icons` (bundled with Expo) or `lucide-react-native` only if approved
- **Images**: `expo-image` (SDK-compatible) when needed for remote/cached images

**Backend integration (existing):** Attendly web app — Next.js 16, PostgreSQL/Drizzle, NextAuth, REST route handlers in `../web-app/app/api`. The mobile app must call **student-scoped** API endpoints only; never expose database credentials or server secrets.

Do not introduce new major libraries without a strong reason (see §12). Keep total runtime dependencies lean (target: under 10 app dependencies, excluding Expo/React Native baseline packages required by the SDK).

---

## 4. Development Philosophy

Build **feature by feature**, smallest useful version first:

1. Read this file before coding.
2. Understand the request and identify the files to change.
3. Keep the implementation simple; prefer readable code over clever code.
4. Build the smallest working version; refactor only when repetition or complexity appears.
5. Make the feature work **end-to-end** (API contract → hook/client → screen → UI states) before polishing.
6. Do not rewrite unrelated code; follow existing patterns.
7. Fix type/lint errors before finishing.
8. Ship-ready over perfect: prioritize working, readable student flows for attendance, exams, and fees.

---

## 5. Architecture

```txt
app/
  _layout.tsx           # Root layout: providers (QueryClient, auth/session), global config
  (auth)/               # Public/auth screens (sign-in, OTP/verification, forgot/reset if needed)
  (tabs)/               # Authenticated tab layout and main student screens
    index.tsx           # Home/dashboard summary
    attendance.tsx      # Student attendance view
    exams.tsx           # Exams and marks view
    fees.tsx            # Fee payments/receipts view
    profile.tsx         # Profile/settings/sign-out
  modal/                # Optional modal routes (details, filters) when needed
components/
  ui/                   # Reusable UI primitives (Button, Card, Badge, EmptyState, etc.)
  <domain>/             # Feature components (attendance/, exams/, fees/, auth/)
constants/
  images.ts             # Centralized image/asset exports
  theme.ts              # App theme tokens/constants used alongside Tailwind
  routes.ts             # Route name/path helpers if needed
hooks/
  use-*.ts              # React Query hooks and screen/data hooks
lib/
  api.ts                # Fetch wrapper, base URL, auth header, error handling
  auth.ts               # Session/token helpers using expo-secure-store
  query-client.ts       # TanStack Query client configuration
  validation.ts         # Zod schemas for API responses/auth payloads
  utils.ts              # Small shared utilities (formatting, classnames/helpers)
store/
  auth-store.ts         # Small global auth/session UI state only (if needed)
types/
  index.ts              # Shared app/domain types
assets/
  images/               # PNG/JPG/WebP illustrations and photos
  icons/                # App icons/adaptive icons/splash source assets
```

Rules of thumb:
- **Screens compose; logic lives elsewhere.** Route files in `app/` should mostly wire layout, hooks, and components.
- **Server state belongs in React Query hooks.** Do not duplicate fetched server data in Zustand.
- **Keep API access centralized** in `lib/api.ts` so auth, base URL, and error handling are consistent.
- **Student-scoped only.** Every data screen shows the currently authenticated student's data; do not build admin/teacher management features here.

---

## 6. UI Rules

- The goal is to **replicate provided design references exactly**. When a design image/mockup is given, match layout, spacing, padding, font sizes/hierarchy, colors, border radius, shadows, alignment, and proportions. **Do not approximate or simplify** unless explicitly asked.
- Design for **mobile first**: comfortable touch targets, readable typography, clear hierarchy, and safe-area-aware layouts.
- Reuse existing primitives from `components/ui/*` and feature components before creating new ones.
- Show clear **loading, empty, error, and success** states for every data screen.
- Keep navigation simple and predictable: primary student areas in tabs; detail views in stack/modal routes.
- Use semantic status colors consistently for attendance/payment/result states (present/absent/late, paid/unpaid/partial, pass/fail/published where applicable).
- Ensure layouts work on small phones and large phones; test both iOS and Android spacing/safe areas.

---

## 7. Styling Rules

- **NativeWind / Tailwind classes first.** Use `className` with NativeWind for styling whenever the component and prop support it.
- Keep styles readable: extract repeated patterns into reusable components or small utility class strings; avoid giant unreadable class blobs when a component abstraction is clearer.
- Use theme tokens/constants for shared colors/spacing/radius where useful; avoid random one-off hex values when a design token exists.
- **Fallback to `StyleSheet` or inline `style` only when NativeWind cannot express it** or React Native props require style objects.

| Component / Scenario | Why NativeWind may not fit | Use Instead |
| --- | --- | --- |
| `SafeAreaView` / safe-area edge cases | Native support/props can be inconsistent depending on component/source | `react-native-safe-area-context` + inline style/`StyleSheet` where needed |
| `Modal` | `visible`, `transparent`, animation/overlay behavior often need prop-driven styles | Inline style / `StyleSheet` |
| `KeyboardAvoidingView` | Behavior/offset/platform props | Inline style / `StyleSheet` |
| `ScrollView` content/indicator styles | `contentContainerStyle`, indicator props | `StyleSheet` / inline style objects |
| `Animated.View` / Reanimated animated styles | Animated style values | `StyleSheet` / animated style hooks |
| Dynamic/runtime-computed styles | Values depend on data, dimensions, or animation | Inline style or `StyleSheet.create` |
| Platform-specific shadows/elevation tweaks | iOS shadow + Android elevation differences | `StyleSheet` with `Platform.select` |
| Pressed/focus state style functions | Render-prop style callbacks | `StyleSheet` / function style |

- Do not install styling/UI libraries just to avoid writing simple styles. If NativeWind cannot do a specific thing, use plain React Native styling.

---

## 8. State Rules

- **Server state → TanStack Query.** Attendance, exams, fees, profile, and other backend data are fetched through `hooks/use-*.ts` with stable query keys. Handle loading, error, empty, and refetch states.
- **Local UI state → `useState`/`useReducer`** in the component/screen that owns it (filters, tab selection, modal visibility, form inputs).
- **Small global client state → Zustand** only when truly shared across screens (e.g. auth session status, selected student context if ever needed). Keep stores small and focused.
- **Persist securely when needed.** Persist auth tokens/sessions only in `expo-secure-store`. Use AsyncStorage only for non-sensitive UI preferences if needed and approved; do not store secrets or sensitive tokens in AsyncStorage.
- Do not duplicate server-fetched data in global stores. Invalidate/refetch React Query caches after mutations.

---

## 9. TypeScript Rules

- `strict: true` is on. **No `any`.** Use `unknown` + narrowing, generics, or precise types.
- Keep types simple and readable. Define shared domain types in `types/` and Zod-inferred types where useful.
- Validate external data at boundaries: API responses, auth payloads, and deep-link/query params where applicable. Do not trust raw `fetch` JSON blindly.
- Type navigation params and hook return values when it improves clarity.
- Use the `@/*` path alias for app imports once configured.

---

## 10. Asset Rules

- Store static assets under `assets/images/` and app icons/splash sources under `assets/icons/` (or Expo default asset locations chosen at scaffold).
- **Centralize image imports** in `constants/images.ts`; screens/components should import from `constants/images` rather than requiring image paths ad hoc.
- Use clear, kebab-case names: `attendance-empty-state.png`, `student-avatar-placeholder.png`, `app-icon.png`.
- Prefer `expo-image` for remote/cached images; use React Native `Image` for simple local static assets when sufficient.
- Keep asset sizes mobile-friendly; compress large images before adding them.

---

## 11. Secret Rules

- **Never expose secrets in client code.** No database URLs, service-role keys, private API keys, or server-only tokens in the mobile app, `.env` files bundled for public client use, or source control.
- The mobile app may only use public runtime config intended for clients (e.g. API base URL, Expo project config) via Expo app config/env conventions.
- Auth tokens/sessions come from **backend/student auth endpoints** and are stored only in `expo-secure-store`.
- All privileged operations and sensitive data access happen on the **server** (`../web-app` API routes/server logic). The mobile app calls student-scoped endpoints and renders the result.
- Do not log tokens, OTP codes, passwords, or sensitive personal data.

---

## 12. Decision Rules

- **Ask before installing a new library.** If a dependency would clearly simplify the work, recommend it, explain why, and wait for approval before adding it.
- **Ask before changing existing UI** or established navigation/design patterns.
- **Ask before changing backend contracts.** If the mobile app needs a new student-scoped endpoint or auth change in `../web-app`, propose the minimal API change and get approval.
- If a request is ambiguous or risky (auth model, data ownership, offline behavior, store release requirements), propose the safest simple option and confirm before implementing.
- Keep the dependency footprint small; prefer built-in Expo/React Native capabilities when they are good enough.

---

## 13. Final Reminder

**Read this file before every feature.** Follow it strictly: build the smallest correct student-facing version end-to-end, keep screens simple, use NativeWind first, fetch server data with TanStack Query, validate boundaries with Zod/TypeScript, store tokens only in Secure Store, keep secrets on the server, and replicate provided designs exactly.