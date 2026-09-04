/**
 * Capacitor regenerates android/ from scratch, so anything native lives here and
 * is re-applied after every `cap sync`. Run with: node scripts/android-extras.mjs
 *
 * Adds: runtime permissions, the noteflow:// deep link, launcher long-press
 * shortcuts, and the home-screen widget.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const APP = "android/app/src/main";
const PKG = "com.noteflow.app";

if (!existsSync(APP)) {
  console.error("android/ not found — run `npx cap add android` first.");
  process.exit(1);
}

const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  console.log("  wrote", path);
};

/* ── 1. Manifest ─────────────────────────────────────────────────── */
const manifestPath = join(APP, "AndroidManifest.xml");
let m = readFileSync(manifestPath, "utf8");

const PERMISSIONS = `
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <!-- Android 11+ requires declaring the speech service you intend to talk to -->
    <queries>
        <intent>
            <action android:name="android.speech.RecognitionService" />
        </intent>
        <intent>
            <action android:name="android.media.action.IMAGE_CAPTURE" />
        </intent>
    </queries>
`;

if (!m.includes("android.permission.RECORD_AUDIO")) {
  m = m.replace("</manifest>", `${PERMISSIONS}</manifest>`);
}

const ACTIVITY_EXTRAS = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="noteflow" />
            </intent-filter>

            <meta-data
                android:name="android.app.shortcuts"
                android:resource="@xml/shortcuts" />
`;

if (!m.includes('android:scheme="noteflow"')) {
  m = m.replace("</activity>", `${ACTIVITY_EXTRAS}        </activity>`);
}

const RECEIVER = `
        <receiver
            android:name=".NoteFlowWidget"
            android:exported="false">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/noteflow_widget_info" />
        </receiver>
`;

if (!m.includes("NoteFlowWidget")) {
  m = m.replace("</application>", `${RECEIVER}    </application>`);
}

writeFileSync(manifestPath, m);
console.log("  patched AndroidManifest.xml");

/* ── 2. Launcher long-press shortcuts ────────────────────────────── */
write(join(APP, "res/xml/shortcuts.xml"), `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="note"
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutShortLabel="@string/sc_note_short"
        android:shortcutLongLabel="@string/sc_note_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:data="noteflow://new/note"
            android:targetPackage="${PKG}"
            android:targetClass="${PKG}.MainActivity" />
        <categories android:name="android.shortcut.conversation" />
    </shortcut>
    <shortcut
        android:shortcutId="journal"
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutShortLabel="@string/sc_journal_short"
        android:shortcutLongLabel="@string/sc_journal_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:data="noteflow://new/journal"
            android:targetPackage="${PKG}"
            android:targetClass="${PKG}.MainActivity" />
        <categories android:name="android.shortcut.conversation" />
    </shortcut>
    <shortcut
        android:shortcutId="task"
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutShortLabel="@string/sc_task_short"
        android:shortcutLongLabel="@string/sc_task_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:data="noteflow://new/task"
            android:targetPackage="${PKG}"
            android:targetClass="${PKG}.MainActivity" />
        <categories android:name="android.shortcut.conversation" />
    </shortcut>
</shortcuts>
`);

/* ── 3. Widget metadata ──────────────────────────────────────────── */
write(join(APP, "res/xml/noteflow_widget_info.xml"), `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:updatePeriodMillis="1800000"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@mipmap/ic_launcher"
    android:initialLayout="@layout/noteflow_widget" />
`);

/* ── 4. Widget look ──────────────────────────────────────────────── */
write(join(APP, "res/drawable/widget_bg.xml"), `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <corners android:radius="24dp" />
    <gradient
        android:startColor="#5B9BE0"
        android:endColor="#4A63C8"
        android:angle="290" />
</shape>
`);

write(join(APP, "res/drawable/widget_btn.xml"), `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <corners android:radius="14dp" />
    <solid android:color="#33FFFFFF" />
</shape>
`);

write(join(APP, "res/layout/noteflow_widget.xml"), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/wRoot"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@drawable/widget_bg"
    android:padding="16dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:baselineAligned="false">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="wrap_content"
            android:orientation="vertical">
            <TextView
                android:id="@+id/wGreeting"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="NoteFlow"
                android:textColor="#FFFFFF"
                android:textSize="17sp"
                android:textStyle="bold" />
            <TextView
                android:id="@+id/wSummary"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="3dp"
                android:text="Tap to open"
                android:textColor="#D9FFFFFF"
                android:textSize="13sp" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:gravity="center_horizontal">
            <TextView
                android:id="@+id/wStreak"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0"
                android:textColor="#FFFFFF"
                android:textSize="24sp"
                android:textStyle="bold" />
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="streak"
                android:textColor="#C4FFFFFF"
                android:textSize="11sp" />
        </LinearLayout>
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="14dp"
        android:orientation="horizontal"
        android:baselineAligned="false">

        <TextView
            android:id="@+id/wNote"
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="42dp"
            android:layout_marginEnd="8dp"
            android:background="@drawable/widget_btn"
            android:gravity="center"
            android:text="Note"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/wJournal"
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="42dp"
            android:layout_marginEnd="8dp"
            android:background="@drawable/widget_btn"
            android:gravity="center"
            android:text="Journal"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/wTask"
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="42dp"
            android:background="@drawable/widget_btn"
            android:gravity="center"
            android:text="Task"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:textStyle="bold" />
    </LinearLayout>
</LinearLayout>
`);

/* ── 5. Widget code ──────────────────────────────────────────────── */
write(join(APP, `java/${PKG.split(".").join("/")}/NoteFlowWidget.java`), `package ${PKG};

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONObject;

/**
 * Home-screen widget. Reads the summary the web app writes through the
 * Capacitor Preferences plugin, so no data crosses a bridge at runtime.
 */
public class NoteFlowWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            manager.updateAppWidget(id, build(context));
        }
    }

    private RemoteViews build(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.noteflow_widget);

        String greeting = "NoteFlow";
        String summary = "Tap to open";
        String streak = "0";

        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String raw = prefs.getString("noteflow_widget", null);
            if (raw != null) {
                JSONObject o = new JSONObject(raw);
                int open = o.optInt("openTasks", 0);
                int done = o.optInt("doneTasks", 0);
                int notes = o.optInt("notes", 0);
                String name = o.optString("name", "");

                streak = String.valueOf(o.optInt("streak", 0));
                if (name != null && name.length() > 0) {
                    greeting = "Hello, " + name;
                }
                if (open == 0 && done == 0) {
                    summary = notes + (notes == 1 ? " note" : " notes") + " \\u00B7 nothing due today";
                } else {
                    summary = done + " of " + (open + done) + " done today";
                }
            }
        } catch (Exception ignored) {
            // a widget should never be the reason anything breaks
        }

        views.setTextViewText(R.id.wGreeting, greeting);
        views.setTextViewText(R.id.wSummary, summary);
        views.setTextViewText(R.id.wStreak, streak);

        views.setOnClickPendingIntent(R.id.wRoot, open(context, "noteflow://open", 0));
        views.setOnClickPendingIntent(R.id.wNote, open(context, "noteflow://new/note", 1));
        views.setOnClickPendingIntent(R.id.wJournal, open(context, "noteflow://new/journal", 2));
        views.setOnClickPendingIntent(R.id.wTask, open(context, "noteflow://new/task", 3));

        return views;
    }

    private PendingIntent open(Context context, String url, int code) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.setClassName(context.getPackageName(), context.getPackageName() + ".MainActivity");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            context, code, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
`);

/* ── 6. Strings the shortcuts reference ──────────────────────────── */
const stringsPath = join(APP, "res/values/strings.xml");
let strings = readFileSync(stringsPath, "utf8");
if (!strings.includes("sc_note_short")) {
  strings = strings.replace("</resources>", `    <string name="sc_note_short">Note</string>
    <string name="sc_note_long">New note</string>
    <string name="sc_journal_short">Journal</string>
    <string name="sc_journal_long">Write today's entry</string>
    <string name="sc_task_short">Task</string>
    <string name="sc_task_long">New task</string>
    <string name="widget_name">NoteFlow</string>
</resources>`);
  writeFileSync(stringsPath, strings);
  console.log("  patched strings.xml");
}

console.log("Android extras applied.");
