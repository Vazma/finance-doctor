# Nuestras finanzas

Personal finance PWA for a couple: a private panel per person ("Mis finanzas") and a shared one ("Nuestras finanzas").

- **Personal**: own credits (car…), MSI purchases and expenses. Only the owner can read them (enforced in `firestore.rules`).
- **Shared**: rent, utilities, fixed/variable expenses and shared MSI. The monthly total is split proportionally to each person's gross income (the only personal number the partner can see).
- **Carátulas**: each panel has its own background, picked from `src/lib/themes.js`.

Stack: Vite + React 19 + Tailwind v4 + vite-plugin-pwa, Firebase Auth (Google) + Firestore + Hosting.

## Data model

| Path | Who |
| --- | --- |
| `config/access` `{ emails: [] }` | Allowlist, written only with admin credentials (`scripts/set-access.mjs`) |
| `users/{uid}` (`theme`), `users/{uid}/expenses`, `users/{uid}/commitments` | Owner only |
| `households/home` (`theme`), `households/home/expenses`, `households/home/commitments` | Both members |
| `households/home/members/{uid}` `{ income, displayName, email }` | Both read, owner writes |

`expenses`: `{ name, amount, kind: 'fixed' | 'variable', month }`. `commitments`: `{ name, type: 'credit' | 'msi', monthly, months, startMonth }`.

## Development

Requires Node 22 and Java 21+ (Firebase emulators).

```bash
npm install
npm run emulators            # Auth + Firestore emulators
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/set-access.mjs el@example.com,ella@example.com
npm run dev                  # uses .env.development (emulators)
npm test                     # finance logic
npm run test:rules           # security rules against the emulator
```

## Deploy

Fill `.env.production.local` from `.env.example`, then:

```bash
npm run build
firebase deploy --only hosting,firestore:rules --project <project-id>
```
