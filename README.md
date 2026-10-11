# StudyTrack

Next.js conversion of `study_tracker_app.html`. Tasks are read and saved through a server-only Google Sheets API integration. The spreadsheet ID and tab `gid` are preconfigured from the supplied URL.

## Google Sheets setup

1. Create a Google Cloud service account and enable the Google Sheets API.
2. Share the spreadsheet with the service account email as an Editor. The private key stays server-side.
3. Copy `.env.example` to `.env.local` and set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`. In Vercel, add those two values as encrypted environment variables for Preview and Production.
4. The target tab is looked up by `gid=262214206`; the app reads its actual tab title from spreadsheet metadata.
5. The header row is matched case-insensitively. Supported columns are `Week`, `Date`, `Day`, either a combined `Study Time` column or separate `Start Time` and `End Time` columns, `Subject`, `Task Title`, `Concepts to Learn`, `Hands-on Practice`, `Interview Practice`, `Completion Goal`, `Status`, `Notes / Mistakes`, and `Completed Date`. `Carried Over` is optional. Add `Task ID` if possible for stable identifiers. For a combined `Study Time` cell, use a range such as `7:00 AM - 8:00 AM`. Writes update only matched task rows or append a row; unrelated columns are preserved.

The app supports the existing combined `Study Time` format as well as separate start/end columns. The live sheet must be accessible to the configured service account for runtime reads and writes.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` creates the production build. Deploy with Vercel after adding the service-account environment variables. Do not commit `.env.local` or private keys.
