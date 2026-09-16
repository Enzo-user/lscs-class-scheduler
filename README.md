# LSCS Class Scheduler

A small class-scheduling web app for the LSCS Frontend Engineering take-home. Students browse a course catalogue, search and filter it, add one section per course to a personal schedule, swap or remove sections, and see the result as a Monday-to-Saturday timetable. The catalogue is mock data served as a static JSON file behind a thin API module, so a real backend can be plugged in by setting one environment variable. There is no hosted deployment; the app runs locally with the commands below.

Repository: https://github.com/Enzo-user/lscs-class-scheduler

## Features

Required by the brief:

- **Browse** courses and their sections. Each course card shows code, units and title; expanding it lists every section with instructor, meeting days and times, and room.
- **Search and filter.** Free-text search over code, title, section and instructor (all typed words must match), day chips ("meets on any of these days") and a units dropdown. A live "Showing X of Y courses" line reports the result.
- **Add a section** to the schedule from its card, with toast feedback ("Added CCPROG1 S11").
- **Remove or change a section.** A course with a section already selected offers "Switch to this section" on its other sections; "Remove" is available both on the card and in the schedule list. "Clear all" asks for confirmation first.
- **Timetable.** The schedule is drawn as a weekly CSS-grid timetable (07:00 to 21:00, 15-minute rows) with colour-coded blocks, next to a readable list of the selected sections and a running units total.

Extensions I implemented because they were small and made the required features safer:

- **Conflict detection.** A section whose meetings overlap something already on the schedule cannot be added; its button is `aria-disabled` and the row says which selection it clashes with. Sections of the same course are excluded because choosing one replaces the other.
- **Persistence.** The selection is saved to `localStorage` under a versioned key and restored on reload; corrupt or stale entries are ignored.
- **Keyboard and screen-reader support.** Semantic landmarks and headings, labelled inputs, `aria-pressed` toggles, `aria-expanded` card headers, visible focus rings, live regions for loading, results and toasts, and an `sr-only` course name on every Add/Remove button.
- **Loading, empty and error states** for the catalogue, the filtered list and the schedule, with a retry button on errors.
- **Tests.** 70 Vitest tests across 11 files covering the domain functions, reducer, provider persistence, API client, hooks and the UI end to end.

## Getting started

Prerequisites: Node 22 or newer and npm.

```bash
git clone https://github.com/Enzo-user/lscs-class-scheduler.git
cd lscs-class-scheduler
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Type-checks (`tsc -b`) then builds to `dist/` |
| `npm run preview`   | Serves the production build locally           |
| `npm test`          | Runs the Vitest suite once (`vitest run`)     |
| `npm run test:watch`| Runs Vitest in watch mode                     |
| `npm run lint`      | Runs oxlint                                   |
| `npm run typecheck` | Runs `tsc -b` without building                |

### Seeing the loading and error states

The API module adds a 500 ms artificial delay to every request so the skeleton loading state is visible even with a local file. To see the error state, add `?mockError=1` to the URL (any value works, the parameter only has to be present):

```
http://localhost:5173/?mockError=1
```

The request then fails with a simulated 500 after the delay and the page shows the error panel with a Retry button. Both switches live in `src/api/coursesApi.ts` and are meant to be deleted together with the mock data.

### Pointing the app at a real API

The base URL defaults to `/data`, which is where Vite serves `public/data/courses.json`. Set `VITE_API_BASE_URL` to the origin (or path prefix) of a backend that exposes `GET <base>/courses.json` returning the JSON shape below:

```bash
VITE_API_BASE_URL=https://api.example.edu/v1 npm run build
```

`src/api/coursesApi.ts` is the only file that knows the URL; the path constant `COURSES_PATH` is a one-line change if the endpoint has a different name.

## Project structure

```
public/data/courses.json      Mock catalogue (34 courses, 98 sections)
src/
  main.tsx                    Entry point; mounts <App> inside <ScheduleProvider>
  App.tsx                     Page composition: search/filter state, derived lists, action handlers, toasts
  App.test.tsx                End-to-end UI tests against a mocked API
  index.css                   Tailwind import, brand colour tokens, toast keyframe
  vite-env.d.ts               Strict typing for import.meta.env (VITE_API_BASE_URL)
  types/course.ts             Domain types mirroring the API JSON field for field
  api/coursesApi.ts           fetch wrapper: base URL, simulated latency, mock error switch, runtime shape guards
  hooks/
    useCourses.ts             Loads the catalogue once; loading/success/error union + refetch; aborts on unmount
    useDebouncedValue.ts      Debounces the search box value
    useToast.ts               Holds the single current toast and auto-clears it
  lib/                        Pure functions, no React
    time.ts                   Day list, HH:mm parsing/validation, human-readable time and schedule formatting
    filter.ts                 Search index + query/day/units filtering
    schedule.ts               Overlap and conflict detection, unit totals, selection resolution, timetable layout
    courseColor.ts            Deterministic colour per course for timetable blocks and swatches
  state/
    scheduleReducer.ts        ScheduleState { selected: courseId -> sectionId } and its three actions
    scheduleStorage.ts        localStorage load/save with validation and a versioned key
    ScheduleContext.ts        Context object and useSchedule() (kept free of components for Fast Refresh)
    ScheduleProvider.tsx      useReducer + persistence + memoised context value
    useSelectedSections.ts    Resolves the selection map to {course, section} pairs, memoised
  components/
    ui/                       Button, Badge, EmptyState, ErrorState, Skeleton, Toast
    courses/                  CourseSearch, CourseFilters, CourseList, CourseListSkeleton, CourseCard, SectionItem
    schedule/                 ScheduleSummary, Timetable, TimetableBlock, ScheduleSkeleton
    layout/                   AppHeader, AppLayout (two-pane desktop, tabbed mobile)
  test/
    setup.ts                  jest-dom matchers and per-test cleanup
    fixtures.ts               makeCourse / makeSection / slot factories shared by tests
```

Tests are colocated with the code they cover (`*.test.ts` / `*.test.tsx`).

## Data model

Course → Sections → Schedule slots, plus instructor and room on the section. The JSON keeps exactly the field names from the brief so the same file could be served by a real API:

```json
{
  "courses": [
    {
      "id": "CCPROG1",
      "code": "CCPROG1",
      "title": "Logic Formulation and Introductory Programming",
      "units": 3,
      "sections": [
        {
          "id": "CCPROG1-S11",
          "section": "S11",
          "instructor": "Katrina Ocampo",
          "room": "Y602",
          "schedule": [
            { "day": "Wednesday", "startTime": "12:45", "endTime": "14:15" },
            { "day": "Saturday",  "startTime": "12:45", "endTime": "14:15" }
          ]
        }
      ]
    }
  ]
}
```

`src/types/course.ts` is the TypeScript mirror of this shape, and `coursesApi.ts` checks every incoming payload against it at runtime, so a malformed response fails with a clear `ApiError` instead of an `undefined` deep inside a component.

The mock data lives in `public/data/courses.json`: 34 DLSU-style courses (CCPROG1 to STCLOUD, a few GE and lab courses) with 2 to 4 sections each, 98 sections in total, fictional instructors and rooms. I generated it with a small seeded script (not part of the repo) rather than typing it by hand, so I could assert properties on the whole set: unique ids, `endTime` after `startTime`, standard DLSU day pairs (Mon/Thu, Tue/Fri, Wed/Sat) and time slots, no overlapping sections within the same course, and no instructor or room booked twice at the same time.

On conflicts: the brief says the mock data may be assumed conflict-free and that detection is optional. My data is conflict-free *within* a course, but sections of *different* courses do overlap on purpose so the conflict check has something to show. The app treats a clash as a hard block rather than a warning, because a schedule with two classes at the same time is not one a student can actually enrol in.

## Technical rationale

**Vite + React 19 + TypeScript, not Next.js.** The brief allows either; this app is one page, has no server, no routing and no SEO requirement, so Next.js would add a server runtime, file-based routing and a rendering model without using any of them. Vite gives a fast dev server, a plain static build and a Vitest config that shares the same plugins. The trade-off is that adding server-side features later means adding a framework then.

**Tailwind v4, no component library.** The UI needs a handful of primitives (button, badge, empty state, skeleton, toast), which are about 30 lines each in `components/ui/` and fully under my control for accessibility attributes. shadcn/ui or MUI would bring a design system and a dependency tree far larger than the app for the same five components. Tailwind keeps styling colocated and the build only ships classes that are used; the cost is longer `className` strings.

**Context + `useReducer`, not Redux, Zustand or TanStack Query.** There is exactly one piece of shared, mutable state: the schedule, shaped as `{ selected: Record<courseId, sectionId> }`. Keying by course id is what enforces "one section per course": `ADD_SECTION` on a course that is already selected overwrites the previous section, so *changing* a section is the same action as adding one and there is no separate invariant to keep. A reducer makes the three transitions (`ADD_SECTION`, `REMOVE_COURSE`, `CLEAR`) pure and unit-testable, and the provider persists every change. Search and filter inputs are plain `useState` in `App` because nothing else needs them. A store library would be justified when several unrelated slices or middleware appear; TanStack Query would be justified once the catalogue is refetched, cached across pages or mutated on a server. Neither is true here, so I kept the hand-written hook (with an `AbortController` for the one real hazard, a stale response landing after a retry or unmount).

**Data layer: `api/coursesApi.ts` + `hooks/useCourses.ts`.** Components never call `fetch`; they call `useCourses()` and get a discriminated union (`loading | success | error`) plus `refetch`. The API module owns the base URL (`VITE_API_BASE_URL`, defaulting to the static file), the simulated latency and the mock error switch, and validates the payload. Swapping in a real backend is an environment variable, and deleting the mock behaviour is two constants in one file. The trade-off of hand-written type guards over a schema library like zod is a few more lines in exchange for one less dependency.

**Domain logic in pure functions (`src/lib/`).** Overlap detection, conflict lookup, filtering, the search index, timetable row/column layout and time formatting are plain TypeScript with no React imports. They are the easiest code to test (over half of the 70 tests target them and the reducer) and the easiest to explain: `slotsOverlap` is one comparison, `buildTimetable` turns entries into `gridRow`/`gridColumn` numbers so the `Timetable` component only places boxes.

**Performance decisions.**
- `buildSearchIndex` lowercases and joins the searchable text once per fetched catalogue (`useMemo` on `data`), so each keystroke does an `includes` over short strings rather than re-normalising every course.
- The search box is bound to the raw value for instant typing while filtering runs on a 200 ms debounced copy; `filterCourses` is memoised on the index and the filter object.
- `CourseCard` and `SectionItem` are `React.memo` components. The provider's actions are `useCallback([])` so their identity never changes, and `SectionItem` receives only primitives and stable objects (`state`, a conflict string, the section), so an add or remove re-renders only the rows whose state or conflict text changed, not all 98. Cards skip re-renders caused by toast updates and un-debounced keystrokes.
- Selection lookups are object-key reads (`selected[course.id]`), the selected sections are resolved once (`useSelectedSections`), and the timetable layout is memoised on those entries. All lists are keyed by stable ids (`course.id`, `section.id`, `sectionId-day` for blocks).
- Both panes stay mounted on mobile (`hidden` rather than unmounted) so switching tabs costs nothing and card expand state survives.

At 10,000 courses the plain `<ul>` would be the bottleneck; `CourseList` marks where a windowed list (`@tanstack/react-virtual`) would wrap it. Search would move server-side with pagination, `useCourses` would become a query hook with a cache, and the client-side index would be dropped.

**Responsiveness.** One layout component: from the `lg` breakpoint the catalogue and the schedule sit side by side (5/7 split) with the schedule pane sticky and scrolling internally; below it a two-button segmented control switches panes. The timetable keeps a 40 rem minimum width and scrolls horizontally inside its own box on phones so blocks stay legible instead of collapsing. Buttons have minimum heights for touch targets and the page never scrolls sideways.

**Accessibility.** Semantic `header`/`main`/`section` with headings, `label`s on inputs, a `fieldset`/`legend` for the day chips with `aria-pressed`, `aria-expanded`/`aria-controls` on card headers, `role="status"` live regions for loading, result counts and toasts, `role="alert"` for the error panel, and `focus-visible` rings on every control. Conflicting sections use `aria-disabled` plus `aria-describedby` pointing at the visible reason, so the button stays focusable and the reason is read out. The timetable grid itself is `aria-hidden`: it is a visual projection of the "Selected sections" list, which is the accessible representation, and a short `sr-only` summary says how many meetings are drawn. Colour is never the only signal; every block carries its course code.

**Loading, empty and error states.** `useCourses` exposes a three-state union so `App` cannot render data that is not there. Loading shows card and schedule skeletons plus an `sr-only` "Loading courses…"; the filtered list distinguishes "No courses match" (with a Clear filters button) from a genuinely empty catalogue; the schedule shows "No sections yet" and an overlay on the empty timetable; errors render the message with a Retry button that aborts any in-flight request and refetches.

**Testing.** Vitest with jsdom and Testing Library, 70 tests in 11 files. The pure domain modules are covered exhaustively because they hold the logic a reviewer would most want to trust (overlap edge cases such as touching intervals, AND-search tokens, clamping in the timetable). The reducer and provider tests pin the one-section-per-course rule, localStorage persistence and referential stability of the context value. The API tests use a mocked `fetch` and fake timers to cover HTTP errors, bad payloads, the mock error switch and abort during the delay. `App.test.tsx` drives the real component tree with a mocked API through the user journeys: load, search, add, switch, conflict, clear and error/retry. I did not add browser end-to-end tests; the jsdom suite already exercises the same DOM, and a Playwright layer would double the setup for one page.

## Known limitations and what I would do next

- Conflicts are a hard block. An "add anyway" warning mode would be a one-line change in `SectionItem` (`blocked`), but I chose the stricter behaviour deliberately.
- The 8-colour palette means distinct courses can share a colour on a busy timetable; the block text always identifies the course.
- The mock error switch and the 500 ms delay are development aids inside the API module; they should be removed when a real backend exists.
- Filters are not reflected in the URL, so a filtered view cannot be shared or restored on reload. Query-string state would be the next small feature.
- The timetable window is fixed at 07:00–21:00, which fits the data; a real catalogue with evening classes would need the range derived from the selection.
- No server, so no authentication, no per-student saved schedules beyond `localStorage`, and no enrolment capacity data.
- Next steps, in order: URL-synced filters, list virtualization behind a size threshold, and a schedule export (image or `.ics`).

## UI at a glance

The header shows the app title and, once loaded, the running "N courses · U units" total. On desktop the left column holds the search box, the Mon–Sat day chips, the units dropdown and the course cards; the right column is sticky and holds the selected-sections list above the weekly timetable. On a phone the same two panes sit behind a "Browse | My schedule (n)" toggle. Selected sections are highlighted in the brand green with a "✓ Added" badge on their card, clashing sections carry an amber "Conflicts with …" note, and every add, switch, remove or clear shows a brief toast at the bottom of the screen.
