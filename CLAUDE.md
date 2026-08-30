You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Working Branch & Pull Requests

Never commit directly to `main`. Before making any code changes, run:

```
scripts/start-work-branch.sh <issue-number|none> <feat|fix> [<base-branch>]
```

- `<base-branch>` defaults to `main`; only pass something else when the user explicitly names a different base. The script always branches off the *latest* `origin/<base-branch>`.
- Branch naming is fully mechanical, computed by the script itself as `${type}/${issue-number}/claude-code`:
  - If this work is tied to a GitHub Issue, pass its number. `${issue-number}` becomes `issue-<n>`, and `${type}` is derived from the issue's labels: `enhancement` → `feat`, else `bug` → `fix` (checked in that priority).
  - If there's no issue (pass `none`), `${issue-number}` becomes today's date (`yyyy-MM-dd`).
  - `<feat|fix>` is still required as an argument even when an issue number is given — it's the fallback used whenever the issue has neither label, or there is no issue. Decide it yourself (`feat` for new/enhanced functionality, `fix` for defects) — this is the one judgment call in this step, and it's yours to make, not a subagent's.
- If the computed branch already exists locally, the script just switches to it (resuming prior work) instead of recreating it.
- All of the session's commits go on this branch.

At Session End (see below), the `reporter` subagent pushes this branch and opens a pull request targeting `<base-branch>` — unless an open PR for the branch already exists, in which case it just pushes the update and reuses that PR.

## Session Start Procedure

Before starting any work, run `bash init.sh` from the repo root. It scaffolds required files, verifies the test/build commands, restricts outbound network access to an allowlist, confirms git/gh credentials and GitHub Issues access, and checks Google Drive credentials used for attaching test evidence to GitHub Issues (see Session End Procedure below).

Then always read the following files to understand prior progress and outstanding tasks.

- `claude-progress.txt` — log of past work and handoff notes
- `feature-list.json` — implementation status of each feature

Use this context to decide what to work on in the current session.

## Session End Procedure

When finishing work, complete the following steps **in this order**.

1. Run `npm test` and confirm all tests pass. If any fail, fix the cause before proceeding.
2. Draft the session-end content yourself (this needs judgment, so it's your job, not a subagent's):
   - A summary of this session's work, changes, and any unresolved issues, ready to append to `claude-progress.txt`.
   - The `feature-list.json` entries to upsert so the `status` of each feature implemented or changed in this session reflects reality.
   - If this session's work was requested via a specific GitHub Issue (the user referenced an issue number/URL, or the task began by reading one with `gh issue view`): for each distinct test case that validates the fix, a scratch folder (e.g. under `/tmp`) named `tc1`, `tc2`, ... containing a `title.txt` (first line = short title) plus evidence appropriate to the change — PNG screenshots (e.g. via Playwright) for GUI/component changes, or a plain-text file of input/output patterns for calculation/logic changes. Skip this entirely for work that does not originate from a GitHub Issue.
   - A concise commit message describing the change.
   - A PR title and body (used only if no open PR already exists for the branch).
   - The list of files to commit (code + `claude-progress.txt` + `feature-list.json`).
3. Hand all of the above to the `reporter` subagent to carry out the mechanical wrap-up: attach the issue evidence (zip, upload, and comment — skipped if there's no issue), update `claude-progress.txt` and `feature-list.json`, then commit, push, and open (or reuse) the PR for the current working branch.
