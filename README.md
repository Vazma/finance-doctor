# Nuestras finanzas

Personal finance PWA for a couple: a private panel per person ("Mis finanzas") and a shared one ("Nuestras finanzas").

- **Personal**: own credits (car…), MSI purchases and expenses. Only the owner can read them (enforced in `firestore.rules`).
- **Hogar**: anyone signs in with Google, creates a household and invites their partner with a single-use link ("Copiar liga").
- **Shared**: rent, utilities, fixed/variable expenses and shared MSI. The monthly total is split proportionally to each person's gross income (the only personal number the partner can see).
- **Carátulas**: each panel has its own background, picked from `src/lib/themes.js`.

Stack: Vite + React 19 + Tailwind v4 + vite-plugin-pwa, Firebase Auth (Google) + Firestore + Hosting.

## Data model

| Path | Who |
| --- | --- |
| `invites/{code}` `{ householdId, createdBy, expiresAt, usedBy }` | Single-use invite link (7 days); readable by code only |
| `users/{uid}` (`householdId`, `theme`), `users/{uid}/expenses`, `users/{uid}/commitments` | Owner only |
| `households/{id}` `{ members, theme }`, `households/{id}/expenses`, `households/{id}/commitments` | Household members |
| `households/{id}/members/{uid}` `{ income, displayName, email }` | Both read, owner writes |

`expenses`: `{ name, amount, kind: 'fixed' | 'variable', month }`. `commitments`: `{ name, type: 'credit' | 'msi', monthly, months, startMonth }`.

## Development

Requires Node 22 and Java 21+ (Firebase emulators).

```bash
npm install
npm run emulators            # Auth + Firestore emulators
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
