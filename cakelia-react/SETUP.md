# Cakelia — Setup & Deploy Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| Java JRE | 11+ | https://adoptium.net (required for Firebase emulators) |
| Firebase CLI | latest | `npm install -g firebase-tools` |

---

## 1. Clone & install

```bash
# Install React app dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

---

## 2. Firebase project setup

1. Go to https://console.firebase.google.com → **Add project** → name it "Cakelia"
2. In **Authentication** → **Sign-in method**, enable:
   - Email/Password
   - Google
3. In **Firestore Database** → **Create database** → start in **production mode** → choose a region
4. In **Project settings** → **Your apps** → click **</>** (Web) → register the app → copy the `firebaseConfig` object

---

## 3. Environment variables

### React app (`cakelia-react/.env`)

Copy `.env.example` to `.env` and fill in your Firebase config:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_BASE_URL=https://your-domain.com
```

### Cloud Functions (`cakelia-react/functions/.env`)

Copy `functions/.env.example` to `functions/.env`:

```
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@your-verified-domain.com
CONTACT_TO=your-email@example.com
TRIGGER_SECRET=some-long-random-secret-string
```

Get a free Resend API key at https://resend.com. You must verify a domain to send from a custom address.

---

## 4. Firebase CLI login

```bash
firebase login
firebase use your-project-id
```

---

## 5. Run locally with emulators

```bash
# Terminal 1 — start Firebase emulators
firebase emulators:start

# Terminal 2 — start Vite dev server
npm run dev
```

Emulator ports:
- Auth: http://127.0.0.1:9099
- Firestore: http://127.0.0.1:8080
- Functions: http://127.0.0.1:5001
- Emulator UI: http://127.0.0.1:4000

The React app auto-connects to the emulators when `import.meta.env.DEV === true`.

---

## 6. Run tests

```bash
cd functions
npm test
```

This runs the 11 unit tests for `computeDueReminders` using Node's built-in test runner. No extra packages needed.

---

## 7. Grant yourself admin access (to see contact messages)

1. Sign up / log in at http://localhost:5173
2. Open the Emulator UI → Firestore → find your `users/{uid}` document
3. Add a field: `isAdmin` = `boolean` = `true`
4. The **Messages** tab will appear immediately in your dashboard

In production, do the same in the Firebase console.

---

## 8. Test the birthday reminder trigger manually

```bash
# With emulators running:
curl -X POST http://127.0.0.1:5001/your-project-id/us-central1/triggerReminders

# In production (requires x-trigger-secret header):
curl -X POST https://us-central1-your-project-id.cloudfunctions.net/triggerReminders \
  -H "x-trigger-secret: your-trigger-secret"
```

---

## 9. Deploy to production

```bash
# Deploy everything at once
firebase deploy

# Or deploy individually
firebase deploy --only hosting       # React app (runs npm run build automatically)
firebase deploy --only functions     # Cloud Functions
firebase deploy --only firestore     # Security rules + indexes
```

The `npm run build` predeploy hook runs automatically before hosting deployment.

---

## 10. Post-deploy checklist

- [ ] Firebase Authentication providers enabled (Email/Password + Google)
- [ ] Firestore rules deployed (`firebase deploy --only firestore`)
- [ ] `functions/.env` has real `RESEND_API_KEY` and `CONTACT_TO`
- [ ] Resend domain verified (or use Resend's free shared domain for testing)
- [ ] `VITE_BASE_URL` set to your production domain in `.env` before building
- [ ] Admin `isAdmin: true` set on your user doc in Firebase console
- [ ] Custom domain configured in Firebase Hosting (optional)

---

## Project structure

```
cakelia-react/
  src/
    pages/         React pages (Home, CakePreview, Dashboard, Login, Signup, ...)
    components/    Shared components (Header, Footer, FriendForm, CookieNotice, ...)
    lib/           Firebase init, auth context, Firestore helpers, hooks
    css/           Global styles
  functions/
    lib/
      computeDueReminders.js    Pure function — birthday date logic
      computeDueReminders.test.js  11 unit tests
      mailer.js                 Resend email abstraction
    index.js                    Cloud Functions entry (scheduler + HTTP trigger + contact trigger)
  firestore.rules               Firestore security rules
  firebase.json                 Firebase project config
  .env.example                  Frontend env var template
  functions/.env.example        Backend secrets template
```
