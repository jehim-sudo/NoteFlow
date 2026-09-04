# NoteFlow — Android build

This is the complete source for NoteFlow, ready to package as an Android app.
It is a React app wrapped with [Capacitor](https://capacitorjs.com), which puts the
web build inside a native Android shell and produces a normal, installable APK.

---

## What you need first

| Requirement | Notes |
|---|---|
| **Node.js 18+** | https://nodejs.org |
| **Android Studio** | https://developer.android.com/studio — installs the Android SDK and Gradle |
| **JDK 17+** | Bundled with recent Android Studio |

After installing Android Studio, open it once and let it finish downloading the
SDK. Then set `ANDROID_HOME` (macOS/Linux example — put it in your shell profile):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk    # macOS
# export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" # Windows (PowerShell)
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

> **Shipping for real?** `RELEASE.md` covers signed release builds, the Play
> Store, and the iOS pipeline. This section gets you a debug APK to test with.

## Build the APK — five commands

```bash
cd noteflow-app

npm install                 # 1. fetch dependencies
npm run build               # 2. compile the web app into dist/
npx cap add android         # 3. create the native Android project (once only)
npx cap sync android        # 4. copy the build into it
npm run android:apk         # 5. produce the APK
```

Your APK lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to your phone and open it. Android will ask you to allow installing from
unknown sources — that is expected for a debug build. To install straight over USB
with debugging enabled:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Prefer a GUI?** Run `npm run android:open` instead of step 5. That opens the
project in Android Studio, where **Build → Build Bundle(s) / APK(s) → Build APK(s)**
does the same thing, and the emulator or a connected phone runs it with one click.

---

## Making a release build

A debug APK is fine for your own phone, but it can't go on the Play Store. For that
you need a signed release build.

```bash
# 1. Create a keystore (once — keep this file and the passwords safe forever;
#    losing it means you can never update the app on Play again)
keytool -genkey -v -keystore noteflow.keystore -alias noteflow \
        -keyalg RSA -keysize 2048 -validity 10000

# 2. Build
cd android && ./gradlew assembleRelease
```

Then follow Android Studio's **Build → Generate Signed Bundle / APK** wizard, which
wires the keystore into `android/app/build.gradle` for you. For the Play Store,
choose **Android App Bundle (.aab)** rather than APK.

---

## No Android Studio? Two shortcuts

**Install it as an app straight from the browser.** Run `npm run build`, put the
`dist/` folder on any static host (drag it onto [Netlify Drop](https://app.netlify.com/drop),
or use GitHub Pages), open the URL on your phone, then Chrome menu →
**Add to Home screen**. It launches full-screen with its own icon, works offline,
and keeps your data. No build tools at all.

**Turn that URL into a signed APK.** Paste the same URL into
[PWABuilder](https://www.pwabuilder.com) and it generates a signed Android package
for you in the cloud. The manifest and service worker it needs are already included here.

---

## Calendar

The Planner has a month calendar with a dot per day — accent for open tasks, red
if any of them are high priority, green when everything that day is done, amber
when a journal entry exists. Tapping a date shows that day's tasks and its entry,
and the add field files new tasks straight onto it.

**Settings → Calendar → Add Tasks to Calendar** exports every scheduled task as a
standard `.ics` file, which Google Calendar, Apple Calendar and Outlook all import.
On Android the download opens with the calendar app directly.

Want live two-way sync with the device calendar instead of a file? That needs a
native bridge — add [`@ebarooni/capacitor-calendar`](https://github.com/ebarooni/capacitor-calendar):

```bash
npm i @ebarooni/capacitor-calendar
npx cap sync android
```

and add the read/write permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

The plugin's `createEvent()` can then be called wherever `downloadICS()` is called
today, in `src/App.jsx`.

---

## Project layout

```
noteflow-app/
├── index.html                  entry document, viewport and theme colours
├── package.json                dependencies and build scripts
├── vite.config.js              relative base path (required by Capacitor)
├── capacitor.config.json       app id: com.noteflow.app, name: NoteFlow
├── public/
│   ├── manifest.webmanifest    PWA manifest
│   ├── sw.js                   offline cache for the web build
│   └── icon-*.png              app icons (192, 512, 1024, maskable)
└── src/
    ├── main.jsx                mounts the app + storage bridge
    ├── index.css               safe areas, scroll and selection behaviour
    └── App.jsx                 the entire NoteFlow app
```

### One thing worth knowing

`App.jsx` saves through `window.storage`, which only exists inside the Claude
artifact sandbox. `src/main.jsx` supplies the same API backed by `localStorage`
whenever that global is missing, so the app persists identically on a device with
no changes to the app code. If you later want cloud sync, replacing that one shim
is the only change needed.

### Changing the app identity

Edit `appId` and `appName` in `capacitor.config.json` **before** running
`npx cap add android`. The id must be a reverse-domain string you own, for example
`in.yourname.noteflow`. To change icons, replace the PNGs in `public/`, then run
`npx capacitor-assets generate` or drop your own into `android/app/src/main/res/`.

### Attachments

Notes and journal entries take photos, camera shots and documents. Files are kept
under their own storage keys (`noteflow:att:<id>`), not inside the main document,
so opening the app never loads every photo you ever attached.

Images are resized to 1400px and re-encoded as JPEG before storing — a 4 MB camera
shot becomes roughly 200 KB. Anything still over 2.5 MB after that is rejected with
a message rather than silently failing. Deleting a note or entry deletes its files
too.

On the web this runs on `localStorage`, which browsers cap at about 5–10 MB in
total. That is fine for a few dozen photos. If you want the app to hold hundreds,
swap the shim in `src/main.jsx` for IndexedDB (via [`idb-keyval`](https://github.com/jakearchibald/idb-keyval),
about ten lines) — the storage contract is identical and no app code changes.

### Native features on Android

`scripts/android-extras.mjs` runs after every `cap sync` (the npm scripts and the
CI workflow both call it). Capacitor regenerates `android/` from scratch, so
anything native has to be re-applied each time — that script is the single place
it lives. It adds:

- **Permissions** — microphone, audio settings and camera, plus the `<queries>`
  block Android 11+ needs before an app may talk to the speech service.
- **`noteflow://` deep links**, so the widget and launcher shortcuts can open
  straight into a new note, entry or task.
- **Long-press shortcuts** on the app icon: Note, Journal, Task.
- **A home-screen widget** — greeting, today's progress, streak, and three
  buttons. It reads a summary the web app writes through Capacitor Preferences,
  so no live bridge is needed. Android refreshes it every 30 minutes and whenever
  it is resized or re-added.

### Why dictation needs a plugin

The Web Speech API exists in Chrome but **not in the Android System WebView**,
which is what a Capacitor app runs inside. `useVoice()` therefore prefers
`@capacitor-community/speech-recognition` when running natively and falls back to
the browser API on the web. Both paths feed the same `sink.current(text)`
callback, so the rest of the app is unaware of which engine is in use.

### Changing the typeface

Headings, titles and the journal page use **Plus Jakarta Sans**, self-hosted via
`@fontsource` (imported at the top of `src/main.jsx`) so it renders offline inside
the APK. To swap it, install another family and change one line in `src/App.jsx`:

```bash
npm i @fontsource/outfit          # or figtree, manrope, dm-sans, sora…
```

```js
// src/App.jsx — inside the CSS block
--display:"Outfit", system-ui, -apple-system, sans-serif;
```

Then update the five `@fontsource/...` imports in `src/main.jsx` to match. Body and
interface text deliberately stay on the system font, which is what makes the app
feel native on each platform.

### Voice typing on Android

Dictation uses the browser's Web Speech API, which the Android System WebView
supports. The first time you tap a microphone, Android asks for permission. If it
never asks, add this to `android/app/src/main/AndroidManifest.xml` above `<application>`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

Everything else in the app works with no permissions at all.
