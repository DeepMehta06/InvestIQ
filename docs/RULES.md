# RULES.md — Development Rules

These rules govern all contributions to the Portfolio Optimization Engine. Read before touching any file.

---

## General

1. **No `any` type** in TypeScript — ever. Use `unknown` and narrow properly.
2. **No inline styles** — Tailwind classes only in TSX files.
3. **No hardcoded API URLs** — all via `import.meta.env.VITE_API_URL`.
4. **No ASCII art diagrams** — all architecture diagrams must be Mermaid in Markdown.
5. **All numeric values** in the UI must use the `font-mono` Tailwind class.
6. **All components** export exactly one default export.
7. **All React component prop interfaces** must have JSDoc comments on every property.

---

## Branch Strategy

- `main` — production-ready, always green CI
- `dev` — integration branch, must compile and lint clean
- Feature branches: `feat/<phase>/<description>` (e.g. `feat/phase1/config-panel`)
- Bug fix branches: `fix/<description>`

---

## Commit Messages

Format: `<type>(<scope>): <summary>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(frontend): add AssetSelector chip grid
fix(backend): handle empty frontier in optimizer
docs(phase1): update checklist status
```

---

## File Naming

| Artifact | Convention |
|---|---|
| React components | `PascalCase.tsx` |
| Hooks | `useCamelCase.ts` |
| Services | `camelCaseService.ts` |
| Types | `camelCase.ts` or `index.ts` |
| Python modules | `snake_case.py` |
| Test files | `<module>.test.ts` / `test_<module>.py` |

---

## API Contract

The TypeScript interfaces in `frontend/src/types/index.ts` are the **single source of truth** for the API shape.  
**Do not change them without coordinating with both Deep (frontend) and Vedant (backend).**

---

## Code Quality Gates

Before merging any PR:
- `npm run type-check` — zero errors
- `npm run lint` — zero errors (max-warnings 0)
- `npm run build` — clean production build
- `python -m pytest backend/tests/` — all tests pass

---

## Phase Discipline

- No Phase N+1 code until Phase N checklists are fully checked
- No optimization logic in Phase 1
- No chart rendering in Phase 1 (stub with placeholder div)
- Phases 2–4 are Vedant's domain; Deep must not modify backend core logic

---

## Component Libraries — Approved Sources

You are **not** required to hand-build every UI primitive. The following are explicitly approved:

| Library | How to use | Allowed for |
|---|---|---|
| **Lucide React** (`lucide-react`) | `npm install lucide-react` | **All icons** — mandatory, no emoji/SVG strings |
| **ReactBits** | Copy patterns into components | Animated cards, glass morphism, motion effects |
| **UIverse** | Copy CSS/markup, adapt to Tailwind | Toggles, checkboxes, loaders, button styles |

### Constraints

1. Icons **must** come from `lucide-react` — never raw SVG or emoji for UI chrome.
2. **No full UI kits** (Shadcn, MUI, Ant Design, Chakra) — they override our design system.
3. UIverse CSS may be adapted but must use Tailwind tokens — no hardcoded hex values.
4. If `framer-motion` is added for ReactBits animations, animation durations must be ≤ 300 ms.
5. All pasted external patterns must still pass TypeScript strict, eslint, and no-`any` rules.
6. Credit non-trivial copy-paste with a comment: `// adapted from UIverse — glow-card`

