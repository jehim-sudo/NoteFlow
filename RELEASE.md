# Shipping NoteFlow

Two pipelines. Android you can complete today on any machine. iOS requires a Mac —
there is no way around that, Xcode is the only tool that can sign an iOS binary.

| | Android | iOS |
|---|---|---|
| Machine | Windows, macOS or Linux | **macOS only** |
| Tooling | Android Studio | Xcode 15+, CocoaPods |
| Cost to sideload onto your own phone | Free | Free (rebuild every 7 days) |
| Cost to distribute | $25 once (Play Console) | $99/year (Apple Developer Program) |
| Output | `.apk` (sideload) / `.aab` (Play) | `.ipa` via TestFlight or App Store |

---

# Android — a stable, signed release

A debug APK is fine on your own phone but is signed with a throwaway key, runs
unoptimised, and cannot be updated or published. A release build fixes all three.

## 1. Create your signing key — once, forever

```bash
cd noteflow-app/android/app
keytool -genkey -v -keystore noteflow-release.keystore \
        -alias noteflow -keyalg RSA -keysize 2048 -validity 10000
```

It asks for two passwords and your name/organisation. **Back this file up somewhere
you will still have in five years.** If you lose it, Google Play will never accept
an update to your app again — you would have to publish a new listing and lose your
users. Keep it out of git; `.gitignore` already excludes `*.keystore`.

## 2. Point Gradle at it

Create `android/keystore.properties` (git-ignored, never commit):

```properties
storeFile=noteflow-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=noteflow
keyPassword=YOUR_KEY_PASSWORD
```

Then open `android/app/build.gradle` and make two edits. Above `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

And inside `android { ... }`:

```gradle
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
```

## 3. Set the version

In the same `android { defaultConfig { ... } }` block, bump these on every release.
Play rejects an upload whose `versionCode` is not higher than the last one.

```gradle
        versionCode 1
        versionName "1.0.0"
```

## 4. Build

```bash
npm run android:release     # → android/app/build/outputs/apk/release/app-release.apk
npm run android:bundle      # → android/app/build/outputs/bundle/release/app-release.aab
```

Use the **APK** to sideload or share directly. Use the **AAB** for Google Play —
new apps cannot be published as APKs any more.

Install and test the real thing before you ship it:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 5. Before you call it stable

- Add the microphone permissions to `android/app/src/main/AndroidManifest.xml`, or
  dictation will fail silently on some devices:
  ```xml
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  ```
- Test on a real device, not just the emulator — particularly the camera and file
  pickers, which behave differently per manufacturer.
- Check `minSdkVersion` in `android/variables.gradle`. Capacitor 6 defaults to 22
  (Android 5.1), which covers effectively everyone.
- Turn off web debugging for release. In `MainActivity.java`, or simply confirm
  `android:debuggable` never appears in the release manifest.

---

# iOS

## What you need

- A Mac. Xcode does the signing and it exists only on macOS. A cloud Mac
  (MacStadium, Codemagic, GitHub Actions macOS runners) works if you don't own one.
- **Xcode 15 or newer** from the App Store.
- CocoaPods: `sudo gem install cocoapods` — or `brew install cocoapods`.
- An Apple ID. A free one puts the app on your own device for 7 days at a time.
  The $99/year Apple Developer Program is required for TestFlight and the App Store.

## Build

```bash
cd noteflow-app
npm install
npm run ios:add        # creates the ios/ project — once only
npm run ios:open       # builds the web app, syncs, opens Xcode
```

In Xcode:

1. Select the **App** target → **Signing & Capabilities**.
2. Tick **Automatically manage signing** and choose your Team. Xcode creates the
   provisioning profile for you.
3. Set the Bundle Identifier to something you own — `in.yourname.noteflow`. It must
   match `appId` in `capacitor.config.json`.
4. Pick your connected iPhone from the device menu and press **▶︎** to run it.
5. To distribute: **Product → Archive**, then **Distribute App** → *TestFlight &
   App Store*, or *Ad Hoc* for a direct `.ipa`.

## Required Info.plist entries

iOS **crashes the app** rather than showing a prompt if a permission string is
missing. Open `ios/App/App/Info.plist` and add all four:

```xml
<key>NSCameraUsageDescription</key>
<string>Attach photos to your notes and journal entries.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Attach photos from your library to notes and entries.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Dictate notes and journal entries instead of typing.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Convert what you say into written text.</string>
```

## One real limitation: dictation on iOS

NoteFlow's voice typing uses the Web Speech API. Safari supports it, but **WKWebView
— which is what a Capacitor app runs in — does not.** Everything else works
identically; the microphone buttons will simply report that dictation is unavailable.

To get it working natively, add the community plugin:

```bash
npm i @capacitor-community/speech-recognition
npx cap sync ios
```

Then in `src/App.jsx`, inside `useVoice()`, branch on `Capacitor.isNativePlatform()`
and call `SpeechRecognition.start({ partialResults: true })`, feeding its listener
into the same `sink.current(...)` callback the web path already uses. The hook was
written with one entry and one exit point precisely so this swap stays small — the
rest of the app calls `voice.toggle(id, onText)` and does not care which engine is
behind it.

---

# Keeping it stable across releases

1. Bump `versionName`/`versionCode` (Android) and Version/Build (Xcode) every time.
2. `npm run build` then `npx cap sync` **before every native build** — forgetting
   this ships the previous web bundle inside a new binary, which is the single most
   common Capacitor mistake.
3. Test the upgrade path, not just a fresh install. Your users' notes live in
   `localStorage` under the `noteflow::` prefix; make sure a new version still reads
   the old data before you publish.
4. Consider moving attachments to IndexedDB before you have real users with real
   photos — see the note in `README.md`.
