WapiBei - README

Development

- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`
- Full dev (both): `npm run dev`

Mobile (Capacitor)

After building the web app (`npm run build`), you can add Capacitor and build native shells:

1. Install Capacitor locally: `npm install @capacitor/cli @capacitor/core --save-dev`
2. Initialize (already preconfigured): `npx cap init` (uses `capacitor.config.json`).
3. Add platforms: `npx cap add android` / `npx cap add ios`.
4. Open native IDE: `npx cap open android` or `npx cap open ios`.
5. Sync web assets after changes: `npx cap copy` then rebuild native.


# WapiBeiApp
# WapiBeiApp
