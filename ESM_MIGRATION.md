# TaskFlow ES Module (ESM) Migration

TaskFlow now uses ES module syntax throughout the application source.

## Backend

The backend `package.json` declares `"type": "module"`. Backend source files use:

- `import ... from ...`
- `import { ... } from ...`
- `export default ...`
- `export { ... }`

Local Node imports include the `.js` extension as required by native Node ESM.

## Frontend

The React source already uses ES module syntax. The frontend package also declares `"type": "module"` so the project is explicitly ESM-oriented.

## Run

From the project root:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Keep the real `.env` files local. Only `.env.example` files should be committed to Git.
