# Drive Clone

This is a small Vite + React + Tailwind project showcasing a Drive-like UI with file upload, folders, rename, delete, star, and a file preview modal.

## Setup (Windows Bash)

Open a terminal in the project folder and run:

```bash
cd "c:\Users\hp202\Downloads\shdesignmeld projects\projects\clone  drive\drive-clone"
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

## Notes
- This app uses `lucide-react` for icons.
- If `window.storage` is not available, the app falls back to `localStorage`.
- Files are stored in localStorage (base64 for images and PDFs). Use with small files only.

### Using the server & Postgres
1. Change to `server` folder and install server deps

```bash
cd server
npm install
```

2. Copy `.env.example` to `.env` and update the DB connection:

Database options you can use in the `.env` file:
- `DATABASE_URL` directly, or
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`

3. Run DB migrations to create tables

```bash
npm run init-db
```

4. Start the server

```bash
npm run dev
```

5. Return to the root folder and run the client (set `VITE_API_BASE` in site `.env` if necessary)

```bash
cd ..
npm run dev
```

Enjoy! 👍
