import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search, Plus, X, Check, Pin, PinOff, Archive, Trash2, ChevronRight, ChevronLeft,
  BookOpen, FileText, CheckSquare, LayoutGrid, Moon, Sun, Flame, Cloud, CloudRain,
  CloudSun, Leaf, Lightbulb, Sunrise, Sunset, RotateCcw, Mic, Square, Copy,
  PenLine, Clock, Settings, MoreHorizontal, ArrowUp, CalendarDays,
  Image as ImageIcon, Camera, Paperclip, Download, User
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════ */
/*  DESIGN TOKENS                                                     */
/* ══════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.nf, .nf * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
.nf {
  --bg:#F7F5F1; --card:#FFFFFF; --card-2:#FFFFFF;
  --sep:rgba(60,52,44,.14); --sep-strong:rgba(60,52,44,.26);
  --label:#1A1613; --label-2:#6B6259; --label-3:#948B80; --label-4:#CFC7BC;
  --fill:rgba(120,110,98,.11); --fill-2:rgba(120,110,98,.06);
  --accent:#5856D6; --accent-soft:#ECEBFB;
  --green:#2E9459; --orange:#DC8A15; --red:#CF4436; --yellow:#D9A509; --teal:#2A93AC;
  --bar:rgba(247,245,241,.78); --stage:#DFDAD2;
  --sf:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",sans-serif;
  --display:"Plus Jakarta Sans","Avenir Next","Segoe UI Variable Display",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --round:"Plus Jakarta Sans",ui-rounded,"SF Pro Rounded",system-ui,-apple-system,sans-serif;
  position:fixed; inset:0; display:grid; place-items:center; background:var(--stage);
  font-family:var(--sf); color:var(--label); font-size:17px; line-height:1.35;
  -webkit-font-smoothing:antialiased; letter-spacing:-.01em;
}
.nf.dark {
  --bg:#100E0D; --card:#1B1917; --card-2:#262220;
  --sep:rgba(140,128,116,.2); --sep-strong:rgba(140,128,116,.34);
  --label:#F6F1EC; --label-2:#A79D93; --label-3:#8B8177; --label-4:#4A443E;
  --fill:rgba(150,138,126,.16); --fill-2:rgba(150,138,126,.09);
  --accent:#8280FF; --accent-soft:#221F45;
  --green:#3ECF74; --orange:#F5A623; --red:#FF5A4C; --yellow:#F2C218; --teal:#3FBBD8;
  --bar:rgba(16,14,13,.76); --stage:#000000;
}
/* :where() has zero specificity — these are defaults every component class can
   override, rather than a reset that silently outranks them. */
.nf :where(button) { font:inherit; color:inherit; background:none; border:none; padding:0; cursor:pointer; letter-spacing:inherit; text-align:inherit; }
.nf :where(input, textarea) { font:inherit; color:inherit; background:none; border:none; outline:none; width:100%; letter-spacing:inherit; }
.nf input::placeholder, .nf textarea::placeholder { color:var(--label-3); }
/* No border-radius here — the outline follows each element's own shape. */
.nf :focus-visible { outline:2.5px solid var(--accent); outline-offset:2px; }
.nf ::selection { background:var(--accent-soft); }

/* ---------- device ---------- */
.device {
  position:relative; width:min(100%,452px); height:min(100%,948px); overflow:hidden;
  border-radius:44px; background:#000; box-shadow:0 40px 90px rgba(30,22,14,.36);
}
@media (max-width:560px),(max-height:760px) { .device { border-radius:0; box-shadow:none; height:100%; width:100%; } }
.canvas {
  position:absolute; inset:0; background:var(--bg); display:flex; flex-direction:column;
  overflow:hidden; transform-origin:50% 0; transition:transform .34s cubic-bezier(.32,.72,0,1), border-radius .34s;
}
.canvas.pushed { transform:scale(.925) translateY(12px); border-radius:26px; }

/* paper grain — the whole app sits on textured stock */
.grain {
  position:absolute; inset:0; z-index:33; pointer-events:none; opacity:.5; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.38'/></svg>");
}
.nf.dark .grain { mix-blend-mode:screen; opacity:.22; }

/* ---------- navigation bar ---------- */
.navbar {
  position:absolute; top:0; left:0; right:0; z-index:6; height:calc(52px + env(safe-area-inset-top,0px));
  padding-top:env(safe-area-inset-top,0px); display:flex; align-items:center; gap:4px; padding-left:8px; padding-right:8px;
  transition:background .3s, box-shadow .3s;
}
.navbar.solid { background:var(--bar); backdrop-filter:saturate(180%) blur(22px); -webkit-backdrop-filter:saturate(180%) blur(22px); box-shadow:0 .5px 0 var(--sep); }
.navtitle { flex:1; text-align:center; font-family:var(--display); font-size:16px; font-weight:700; opacity:0; transition:opacity .25s; letter-spacing:-.02em; }
.navbar.solid .navtitle { opacity:1; }
/* flex, not grid — a back button holds a chevron AND a word, side by side */
.navbtn { min-width:38px; height:38px; padding:0 6px; border-radius:19px; display:inline-flex; align-items:center; justify-content:center; gap:1px; white-space:nowrap; color:var(--accent); flex:none; }
.navbtn:active { opacity:.4; }
.navbar.overhero .navbtn, .navbar.overhero .navtitle { color:#fff; }
.navtext { font-size:16px; line-height:1; color:var(--accent); display:inline-flex; align-items:center; }
.navtext.bold { font-weight:600; }

.scroll { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:calc(52px + env(safe-area-inset-top,0px)) 0 128px; }
.scroll.herotop { padding-top:0; }
.scroll::-webkit-scrollbar { width:0; }
.pad { padding:0 18px; }
.large { font-family:var(--display); font-size:33px; font-weight:800; letter-spacing:-.035em; padding:10px 18px 0; line-height:1.1; }
.subhead { font-size:14.5px; color:var(--label-2); padding:0 18px; margin-top:5px; display:flex; align-items:center; gap:7px; }
.subhead .bead { width:6px; height:6px; border-radius:3px; background:var(--accent); }

/* ---------- sky hero ---------- */
.hero {
  position:relative; padding:calc(74px + env(safe-area-inset-top,0px)) 20px 44px; color:#fff; overflow:hidden;
}
.hero::after {
  content:""; position:absolute; left:-30%; top:-58%; width:160%; height:150%; border-radius:50%;
  background:radial-gradient(closest-side, rgba(255,255,255,.30), rgba(255,255,255,0)); pointer-events:none;
}
.hero .hi { font-family:var(--display); font-size:32px; font-weight:800; letter-spacing:-.035em; line-height:1.12; }
.hero .dt { font-size:14px; opacity:.86; margin-top:7px; letter-spacing:.01em; }
.hero .row { display:flex; align-items:center; gap:18px; margin-top:22px; position:relative; }
.hero .cap { font-size:14.5px; opacity:.94; line-height:1.45; }
.hero .chips { display:flex; gap:8px; margin-top:11px; flex-wrap:wrap; }
.hero .hchip {
  display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:600; padding:5px 10px;
  border-radius:11px; background:rgba(255,255,255,.2); border:.5px solid rgba(255,255,255,.26); backdrop-filter:blur(6px);
}
.sheetup { background:var(--bg); border-radius:26px 26px 0 0; margin-top:-24px; padding-top:10px; position:relative; z-index:2; }

.ring { position:relative; width:78px; height:78px; flex:none; }
.ring svg { transform:rotate(-90deg); }
.ring .mid { position:absolute; inset:0; display:grid; place-items:center; font-family:var(--round); font-size:17px; font-weight:700; letter-spacing:-.03em; }

/* ---------- grouped lists ---------- */
.ghead {
  font-family:var(--display); font-size:14px; font-weight:700; letter-spacing:-.005em; color:var(--label);
  padding:24px 18px 9px; display:flex; align-items:center; gap:8px;
}
.ghead::before { content:""; width:4px; height:15px; border-radius:2px; background:var(--accent); flex:none; }
.ghead .r { margin-left:auto; font-family:var(--sf); font-weight:400; color:var(--label-3); font-size:13px; }
.ghead .act { margin-left:auto; font-family:var(--sf); color:var(--accent); font-size:14px; font-weight:600; }
.list { background:var(--card); border-radius:16px; margin:0 18px; overflow:hidden; box-shadow:0 1px 2px rgba(40,30,20,.05),0 6px 16px -8px rgba(40,30,20,.08); }
.nf.dark .list { box-shadow:none; }
.item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; width:100%; text-align:left; min-height:48px; }
.item:active { background:var(--fill-2); }
.item + .item::before { content:""; position:absolute; top:0; left:14px; right:0; height:.5px; background:var(--sep); }
/* checkbox rows: 14 padding + 24 control + 12 gap */
.item + .item.inset::before { left:50px; }
/* icon rows: 14 padding + 30 tile + 12 gap */
.item + .item:has(.sqico)::before { left:56px; }
.item .grow { flex:1; min-width:0; padding:0; }
.ghead .act, .ghead .r { padding:0; }
.item .ttl { font-size:16px; }
.item .sub { font-size:13px; color:var(--label-2); margin-top:2px; }
.item .val { font-size:15px; color:var(--label-2); margin-left:auto; text-align:right; }
.chev { color:var(--label-4); flex:none; }
.gfoot { font-size:12.5px; color:var(--label-2); padding:9px 20px 0; line-height:1.45; }
.item .sub, .item .ttl { padding:0; }
.sqico { width:30px; height:30px; border-radius:9px; display:grid; place-items:center; color:#fff; flex:none; padding:0; box-shadow:0 2px 6px rgba(40,30,20,.16); }

/* ---------- capture ---------- */
.capture {
  margin:16px 18px 0; background:var(--card); border-radius:16px; padding:11px 12px 11px 15px;
  display:flex; align-items:center; gap:10px; box-shadow:0 1px 2px rgba(40,30,20,.05),0 8px 20px -10px rgba(40,30,20,.14);
}
.nf.dark .capture { box-shadow:none; }
.capture input { font-size:16px; }
.capseg { display:flex; gap:6px; margin:11px 18px 0; align-items:center; }
.capseg button { font-size:13px; font-weight:600; color:var(--label-2); padding:5px 12px; border-radius:10px; background:var(--fill-2); }
.capseg button.on { background:var(--accent); color:#fff; }
.capseg .hint { margin-left:auto; font-size:12.5px; color:var(--label-3); }

/* ---------- mic ---------- */
.mic { flex:none; width:33px; height:33px; border-radius:17px; background:var(--fill); color:var(--accent); display:grid; place-items:center; transition:background .18s,color .18s,transform .18s; }
.mic:active { transform:scale(.88); }
.mic.on { background:var(--red); color:#fff; box-shadow:0 0 0 0 rgba(207,68,54,.5); animation:halo 1.6s ease-out infinite; }
@keyframes halo { 70% { box-shadow:0 0 0 12px rgba(207,68,54,0) } 100% { box-shadow:0 0 0 0 rgba(207,68,54,0) } }
.mic.sm { width:28px; height:28px; }
.wave { display:inline-flex; align-items:flex-end; gap:2px; height:13px; }
.wave i { width:2.5px; border-radius:2px; background:currentColor; animation:wv .9s ease-in-out infinite; }
.wave i:nth-child(1){height:5px;animation-delay:0s}.wave i:nth-child(2){height:11px;animation-delay:.15s}
.wave i:nth-child(3){height:7px;animation-delay:.3s}.wave i:nth-child(4){height:13px;animation-delay:.45s}
@keyframes wv { 0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)} }
.dictrow { display:flex; align-items:center; gap:10px; margin-top:12px; font-size:13.5px; color:var(--label-2); }
.dicterr { font-size:13px; color:var(--red); margin-top:8px; }

/* ---------- tasks ---------- */
.check { flex:none; width:24px; height:24px; border-radius:12px; border:1.8px solid var(--label-4); display:grid; place-items:center; transition:background .2s,border-color .2s; }
.check.on { background:var(--green); border-color:var(--green); color:#fff; }
.check svg { opacity:0; transform:scale(.3); transition:transform .3s cubic-bezier(.3,1.8,.5,1),opacity .14s; }
.check.on svg { opacity:1; transform:scale(1); }
.done .ttl { color:var(--label-3); text-decoration:line-through; }
.pdot { width:7px; height:7px; border-radius:4px; flex:none; }
.metaline { display:flex; align-items:center; gap:9px; margin-top:3px; font-size:13px; color:var(--label-2); flex-wrap:wrap; }
.metaline .od { color:var(--red); font-weight:600; }

/* ---------- notes ---------- */
.grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; padding:0 18px; }
.ncard {
  border-radius:18px; padding:14px 14px 12px; text-align:left; display:flex; flex-direction:column; min-height:124px;
  transition:transform .18s cubic-bezier(.3,1.3,.5,1); overflow:hidden; position:relative;
  box-shadow:0 1px 2px rgba(40,30,20,.06),0 10px 22px -12px rgba(40,30,20,.24);
}
.nf.dark .ncard { box-shadow:0 1px 0 rgba(255,255,255,.04); }
.ncard::after { content:""; position:absolute; inset:0; border-radius:18px; background:linear-gradient(150deg,rgba(255,255,255,.5),rgba(255,255,255,0) 46%); pointer-events:none; }
.nf.dark .ncard::after { background:linear-gradient(150deg,rgba(255,255,255,.06),rgba(255,255,255,0) 46%); }
.ncard:active { transform:scale(.965); }
.ncard .em { font-size:19px; }
.ncard h3 { font-family:var(--display); font-size:15.5px; font-weight:700; margin-top:7px; line-height:1.26; letter-spacing:-.02em; }
.ncard p { font-size:13px; color:var(--label-2); line-height:1.44; margin-top:5px; overflow:hidden; }
.ncard .cl { margin-top:8px; display:flex; flex-direction:column; gap:4px; }
.cl .ln { display:flex; gap:6px; font-size:12.5px; color:var(--label-2); align-items:flex-start; line-height:1.3; }
.cl .bx { width:12px; height:12px; border-radius:4px; border:1.4px solid var(--label-4); flex:none; margin-top:1px; display:grid; place-items:center; }
.cl .bx.on { background:var(--green); border-color:var(--green); color:#fff; }
.cl .ln.on span { text-decoration:line-through; color:var(--label-3); }
.ncard .ft { margin-top:auto; padding-top:10px; display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--label-3); }
.tagpill { font-size:11px; font-weight:600; color:var(--accent); background:var(--accent-soft); padding:2px 8px; border-radius:8px; }
.hstrip { display:flex; gap:13px; overflow-x:auto; padding:0 18px 8px; scroll-snap-type:x mandatory; }
.hstrip::-webkit-scrollbar { display:none; }
.hstrip > * { flex:none; width:172px; scroll-snap-align:start; }
.pop { animation:pop .46s cubic-bezier(.22,.9,.3,1) backwards; }
@keyframes pop { from { opacity:0; transform:translateY(12px) scale(.97) } }

/* ---------- controls ---------- */
.searchfield { display:flex; align-items:center; gap:8px; background:var(--fill); border-radius:13px; padding:9px 11px; margin:10px 18px 0; }
.searchfield input { font-size:16px; }
.segmented { display:flex; gap:2px; background:var(--fill); border-radius:12px; padding:3px; margin:14px 18px 0; }
.segmented button { flex:1; min-width:0; padding:7px 6px; border-radius:9px; font-size:13.5px; font-weight:500; color:var(--label); text-align:center; white-space:nowrap; transition:background .22s, color .22s; }
.segmented button.on { background:var(--card); font-weight:600; box-shadow:0 1px 4px rgba(40,30,20,.16); }
.nf.dark .segmented button.on { background:#3A3532; }
.chiprow { display:flex; gap:8px; overflow-x:auto; padding:14px 18px 2px; }
.chiprow::-webkit-scrollbar { display:none; }
.chip { flex:none; padding:7px 13px; border-radius:17px; font-size:13.5px; font-weight:500; background:var(--card); color:var(--label); display:inline-flex; align-items:center; gap:5px; box-shadow:0 1px 2px rgba(40,30,20,.06); }
.nf.dark .chip { box-shadow:none; }
.chip.on { background:var(--accent); color:#fff; }

/* ---------- calendar ---------- */
.cal { background:var(--card); border-radius:18px; margin:16px 18px 0; padding:14px 12px 12px; box-shadow:0 1px 2px rgba(40,30,20,.05),0 8px 20px -12px rgba(40,30,20,.16); }
.nf.dark .cal { box-shadow:none; }
.calbar { display:flex; align-items:center; gap:4px; padding:0 4px 12px; }
.calbar h3 { font-family:var(--display); font-size:16.5px; font-weight:700; letter-spacing:-.025em; }
.calnav { width:32px; height:32px; border-radius:16px; display:grid; place-items:center; color:var(--label-2); }
.calnav:active { background:var(--fill); }
.caltoday { margin-left:auto; font-size:13px; font-weight:600; color:var(--accent); padding:6px 11px; border-radius:11px; background:var(--accent-soft); text-align:center; }
.capseg button, .removephoto, .alert .acts button, .bigbtn, .attbtn { text-align:center; }
.caldow { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; font-size:11px; font-weight:700; color:var(--label-3); letter-spacing:.06em; padding-bottom:6px; }
.calgrid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.cell {
  aspect-ratio:1/1; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  font-size:14.5px; color:var(--label); transition:background .18s,transform .18s cubic-bezier(.3,1.4,.5,1);
}
.cell:active { transform:scale(.9); }
.cell .n { line-height:1; font-variant-numeric:tabular-nums; }
.cell.today .n { font-weight:700; color:var(--accent); }
.cell.on { background:var(--accent); }
.cell.on .n { color:#fff; font-weight:700; }
.cell.on .cdots i { background:rgba(255,255,255,.9) !important; }
.cdots { display:flex; gap:3px; height:5px; align-items:center; }
.cdots i { width:5px; height:5px; border-radius:3px; display:block; }
.callegend { display:flex; gap:14px; justify-content:center; padding:13px 4px 2px; font-size:11.5px; color:var(--label-3); }
.callegend span { display:inline-flex; align-items:center; gap:5px; }
.callegend i { width:6px; height:6px; border-radius:3px; }

/* ---------- profile ---------- */
.avatar {
  border-radius:50%; overflow:hidden; flex:none; display:grid; place-items:center;
  background:var(--accent-soft); color:var(--accent); font-weight:700; letter-spacing:-.02em;
  box-shadow:inset 0 0 0 .5px var(--sep);
}
.avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.profilebanner {
  position:relative; margin:4px 18px 0; padding:26px 20px 24px; border-radius:24px; text-align:center;
  color:#fff; overflow:hidden;
}
.profilebanner::after {
  content:""; position:absolute; left:-25%; top:-70%; width:150%; height:150%; border-radius:50%;
  background:radial-gradient(closest-side, rgba(255,255,255,.28), rgba(255,255,255,0)); pointer-events:none;
}
.profilebanner .nm { position:relative; font-family:var(--display); font-size:23px; font-weight:800; letter-spacing:-.035em; margin-top:15px; }
.profilebanner .since { position:relative; font-size:13px; opacity:.86; margin-top:5px; }
.avatarwrap { position:relative; display:inline-block; padding:0; border-radius:50%; transition:transform .18s cubic-bezier(.3,1.4,.5,1); }
.avatarwrap:active { transform:scale(.94); }
.profilebanner .avatar { background:rgba(255,255,255,.2); color:#fff; box-shadow:0 0 0 4px rgba(255,255,255,.24), 0 12px 28px -12px rgba(0,0,0,.5); }
.camerabadge {
  position:absolute; right:0; bottom:2px; width:34px; height:34px; border-radius:17px; background:#fff;
  color:var(--label); display:grid; place-items:center; box-shadow:0 4px 12px rgba(0,0,0,.28);
}
.removephoto { position:relative; margin-top:14px; font-size:13.5px; font-weight:600; color:#fff; padding:7px 15px; border-radius:13px; background:rgba(255,255,255,.2); }
.removephoto:active { opacity:.6; }

.statgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:0 18px; }
.statcard {
  background:var(--card); border-radius:18px; padding:15px 15px 14px; display:flex; flex-direction:column;
  box-shadow:0 1px 2px rgba(40,30,20,.05),0 8px 20px -14px rgba(40,30,20,.2);
}
.nf.dark .statcard { box-shadow:none; }
.statcard b { display:block; font-family:var(--round); font-size:28px; font-weight:800; letter-spacing:-.045em; line-height:1.1; margin-top:11px; }
.statcard span { font-size:12.5px; color:var(--label-2); margin-top:3px; line-height:1.3; }

/* ---------- attachments ---------- */
.attbar { display:flex; gap:8px; }
.attbusy { font-size:12.5px; color:var(--label-2); margin-top:10px; }
.attbtn {
  flex:1; display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:11px 8px;
  border-radius:14px; background:var(--card); color:var(--label); font-size:13.5px; font-weight:600;
  box-shadow:0 1px 2px rgba(40,30,20,.06);
}
.nf.dark .attbtn { box-shadow:none; background:var(--card-2); }
.attbtn:active { opacity:.6; transform:scale(.97); }
.thumbs { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
.thumb { position:relative; aspect-ratio:1/1; }
.thumbhit { width:100%; height:100%; padding:0; border-radius:14px; overflow:hidden; display:block; background:var(--fill); }
.thumbhit img { width:100%; height:100%; object-fit:cover; display:block; }
.thumbwait { display:block; width:100%; height:100%; background:linear-gradient(100deg,var(--fill),var(--fill-2),var(--fill)); background-size:220% 100%; animation:shim 1.3s linear infinite; }
@keyframes shim { to { background-position:-220% 0 } }
.thumbx {
  position:absolute; top:-5px; right:-5px; width:22px; height:22px; border-radius:11px; background:var(--label);
  color:var(--bg); display:grid; place-items:center; box-shadow:0 2px 6px rgba(0,0,0,.3);
}
.thumbx.flat { position:static; width:26px; height:26px; flex:none; background:var(--fill); color:var(--label-2); box-shadow:none; }
.filelist { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
.filechip { display:flex; align-items:center; gap:8px; }
.filehit { flex:1; min-width:0; display:flex; align-items:center; gap:11px; padding:11px 12px; border-radius:14px; background:var(--card); box-shadow:0 1px 2px rgba(40,30,20,.06); }
.nf.dark .filehit { box-shadow:none; background:var(--card-2); }
.fileico { width:32px; height:32px; border-radius:9px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; flex:none; }
.filemeta { flex:1; min-width:0; text-align:left; }
.filemeta .fn { display:block; font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.filemeta .fs { font-size:11.5px; color:var(--label-3); }
.clip { display:inline-flex; align-items:center; gap:2px; font-weight:600; }
.lightbox {
  position:absolute; inset:0; z-index:34; background:rgba(8,6,5,.94); display:grid; place-items:center;
  padding:56px 16px; animation:fade .22s;
}
.lightbox img { max-width:100%; max-height:100%; border-radius:12px; object-fit:contain; }
.lbclose, .lbsave { position:absolute; top:calc(14px + env(safe-area-inset-top,0px)); width:38px; height:38px; border-radius:19px; background:rgba(255,255,255,.16); color:#fff; display:grid; place-items:center; }
.lbclose { left:14px; }
.lbsave { right:14px; }
.lbname { position:absolute; bottom:calc(20px + env(safe-area-inset-bottom,0px)); left:0; right:0; text-align:center; color:rgba(255,255,255,.72); font-size:12.5px; padding:0 20px; }

/* ---------- journal ---------- */
.jrow .mdot { width:11px; height:11px; border-radius:6px; flex:none; }
.jsnip { font-size:14.5px; line-height:1.5; color:var(--label-2); margin-top:5px; }
.moodpick { display:flex; gap:8px; overflow-x:auto; padding:2px; }
.moodpick::-webkit-scrollbar { display:none; }
.moodbtn { flex:1; min-width:64px; padding:13px 4px 11px; border-radius:15px; background:var(--card); text-align:center; font-size:11.5px; font-weight:600; color:var(--label-2); transition:transform .16s cubic-bezier(.3,1.4,.5,1); }
.moodbtn.on { color:#fff; box-shadow:0 8px 18px -9px rgba(0,0,0,.55); }
.moodbtn:active { transform:scale(.93); }
.moodbtn i { display:block; margin-bottom:6px; }
.dots { display:flex; gap:8px; }
.edot { width:34px; height:34px; border-radius:17px; background:var(--fill); color:var(--label-2); font-family:var(--round); font-size:14px; font-weight:700; display:grid; place-items:center; transition:transform .16s; }
.edot.on { background:var(--orange); color:#fff; }
.edot:active { transform:scale(.9); }
/* the blank page */
.jdate { font-family:var(--sf); font-size:13px; color:var(--label-3); letter-spacing:.02em; margin:6px 0 10px; }
.jpage {
  font-family:var(--display); font-weight:400; font-size:17.5px; line-height:1.72; letter-spacing:-.005em;
  resize:none; min-height:46vh; width:100%; color:var(--label); caret-color:var(--accent);
}
.jpage::placeholder { color:var(--label-4); font-size:17px; line-height:1.65; letter-spacing:-.005em; }
.addmood {
  display:inline-flex; align-items:center; gap:6px; margin-top:14px; padding:8px 14px; border-radius:14px;
  background:var(--fill-2); color:var(--label-2); font-size:13.5px; font-weight:600;
}
.addmood:active { opacity:.6; }
.writebar {
  flex:none; display:flex; align-items:center; gap:12px; padding:11px 16px calc(12px + env(safe-area-inset-bottom,0px));
  background:var(--bar); backdrop-filter:saturate(180%) blur(22px); -webkit-backdrop-filter:saturate(180%) blur(22px);
  box-shadow:0 -.5px 0 var(--sep);
}
.writebar .wc { flex:1; min-width:0; display:flex; align-items:center; gap:9px; font-size:13.5px; color:var(--label-2); }
.writebar .wc em { font-style:normal; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* ---------- tab bar & fab ---------- */
.tabbar {
  position:absolute; left:0; right:0; bottom:0; z-index:7; display:flex;
  padding:9px 6px calc(11px + env(safe-area-inset-bottom,0px));
  background:var(--bar); backdrop-filter:saturate(180%) blur(22px); -webkit-backdrop-filter:saturate(180%) blur(22px);
  box-shadow:0 -.5px 0 var(--sep);
}
.tabbtn { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--label-3); font-size:10px; font-weight:600; padding:2px; transition:color .2s; }
.tabbtn.on { color:var(--accent); }
.tabbtn.on svg { animation:hop .38s cubic-bezier(.3,1.5,.5,1); }
@keyframes hop { 40% { transform:translateY(-4px) scale(1.08) } }
.tabbtn:active { opacity:.5; }
.fab {
  position:absolute; right:19px; bottom:98px; z-index:8; width:57px; height:57px; border-radius:29px;
  color:#fff; display:grid; place-items:center; transition:transform .2s cubic-bezier(.3,1.4,.5,1);
}
.fab:active { transform:scale(.88) rotate(45deg); }

/* ---------- editors & overlays ---------- */
.cover { position:absolute; inset:0; z-index:20; background:var(--bg); display:flex; flex-direction:column; animation:cover .4s cubic-bezier(.32,.72,0,1); }
@keyframes cover { from { transform:translateY(100%) } }
.coverbar {
  flex:none; height:calc(52px + env(safe-area-inset-top,0px)); padding-top:env(safe-area-inset-top,0px);
  display:flex; align-items:center; gap:4px; padding-left:8px; padding-right:8px;
  background:var(--bar); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); box-shadow:0 .5px 0 var(--sep);
}
.coverbody { flex:1; overflow-y:auto; padding:18px 0 60px; }
.coverbody::-webkit-scrollbar { width:0; }
.titlein { font-family:var(--display); font-size:25px; font-weight:800; letter-spacing:-.035em; }
.bodyin { font-size:17px; line-height:1.6; resize:none; min-height:190px; margin-top:12px; }

.sheet { position:absolute; left:0; right:0; bottom:0; z-index:21; background:var(--bg); border-radius:20px 20px 0 0; max-height:90%; overflow-y:auto; animation:cover .38s cubic-bezier(.32,.72,0,1); }
.sheet::-webkit-scrollbar { width:0; }
.grab { width:36px; height:5px; border-radius:3px; background:var(--label-4); margin:8px auto 0; }
.sheetbar { display:flex; align-items:center; padding:12px 14px 4px; }
.sheetbar h2 { flex:1; text-align:center; font-family:var(--display); font-size:16px; font-weight:700; }

.veil { position:absolute; inset:0; z-index:19; background:rgba(26,18,10,.4); animation:fade .3s; }
@keyframes fade { from { opacity:0 } }
.alertwrap { position:absolute; inset:0; z-index:30; display:grid; place-items:center; background:rgba(26,18,10,.34); animation:fade .2s; padding:34px; }
.alert { width:272px; background:var(--card-2); border-radius:16px; overflow:hidden; text-align:center; animation:bounce .28s cubic-bezier(.3,1.3,.5,1); }
@keyframes bounce { from { transform:scale(1.15); opacity:0 } }
.alert .body { padding:20px 17px 15px; }
.alert h3 { font-family:var(--display); font-size:16.5px; font-weight:700; letter-spacing:-.01em; }
.alert p { font-size:13px; color:var(--label-2); margin-top:6px; line-height:1.45; }
.alert .acts { display:flex; border-top:.5px solid var(--sep-strong); }
.alert .acts button { flex:1; padding:12px 6px; font-size:16px; color:var(--accent); }
.alert .acts button + button { border-left:.5px solid var(--sep-strong); }
.alert .acts .danger { color:var(--red); font-weight:600; }

.toast {
  position:absolute; left:18px; right:18px; bottom:104px; z-index:25; display:flex; align-items:center; gap:12px;
  background:rgba(26,22,19,.95); color:#fff; border-radius:16px; padding:13px 15px; font-size:14.5px;
  backdrop-filter:blur(16px); animation:toast .34s cubic-bezier(.3,1.2,.5,1); box-shadow:0 10px 30px rgba(20,14,8,.34);
}
@keyframes toast { from { transform:translateY(18px); opacity:0 } }
.toast button { margin-left:auto; font-size:14.5px; font-weight:600; color:#FFC98B; }

/* ---------- empty states ---------- */
.blank { text-align:center; padding:52px 34px; }
.blank .ic {
  width:88px; height:88px; border-radius:30px; display:grid; place-items:center; margin:0 auto 20px; color:#fff;
  background:var(--accent);
  background:linear-gradient(150deg,var(--accent),color-mix(in srgb,var(--accent) 62%, #000 18%));
  box-shadow:0 14px 30px -12px var(--accent); transform:rotate(-6deg);
}
.blank .ic svg { transform:rotate(6deg); }
.blank h3 { font-family:var(--display); font-size:21px; font-weight:800; letter-spacing:-.03em; }
.blank p { font-size:15px; color:var(--label-2); margin-top:8px; line-height:1.5; }
.bigbtn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px 22px; border-radius:16px; background:var(--accent); color:#fff; font-size:16px; font-weight:600; margin-top:20px; box-shadow:0 10px 24px -12px var(--accent); }
.bigbtn.wide { width:100%; }
.bigbtn.quiet { background:var(--fill); color:var(--accent); box-shadow:none; }
.bigbtn:active { opacity:.78; transform:scale(.98); }
.opts { display:flex; gap:8px; flex-wrap:wrap; }
.opt { padding:9px 14px; border-radius:13px; font-size:14px; font-weight:500; background:var(--card); color:var(--label); display:inline-flex; align-items:center; gap:6px; }
.opt.on { background:var(--accent); color:#fff; font-weight:600; }
.swatch { width:32px; height:32px; border-radius:16px; border:.5px solid var(--sep-strong); }
.swatch.on { box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--accent); }
.switch { margin-left:auto; width:51px; height:31px; border-radius:16px; background:var(--fill); position:relative; transition:background .24s; flex:none; }
.switch.on { background:var(--green); }
.switch i { position:absolute; top:2px; left:2px; width:27px; height:27px; border-radius:14px; background:#fff; box-shadow:0 2px 5px rgba(0,0,0,.26); transition:transform .26s cubic-bezier(.3,1.4,.5,1); }
.switch.on i { transform:translateX(20px); }

/* ---------- onboarding ---------- */
.onb { position:absolute; inset:0; z-index:40; display:flex; flex-direction:column; padding:0 30px calc(30px + env(safe-area-inset-bottom,0px)); overflow-y:auto; color:#fff; }
.onb::-webkit-scrollbar { width:0; }
.onb .mark { width:82px; height:82px; border-radius:24px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); display:grid; place-items:center; color:#fff; margin:82px auto 24px; backdrop-filter:blur(8px); }
.onb h1 { font-family:var(--display); font-size:34px; font-weight:800; letter-spacing:-.04em; text-align:center; line-height:1.12; }
.onb .sub { text-align:center; font-size:15.5px; opacity:.85; margin-top:12px; line-height:1.5; }
.onb .feat { display:flex; gap:15px; align-items:flex-start; margin-top:24px; }
.onb .feat h4 { font-size:16px; font-weight:600; }
.onb .feat p { font-size:14px; opacity:.82; margin-top:3px; line-height:1.45; }
.onb .foot { margin-top:auto; padding-top:36px; }
.onb .bigbtn { background:#fff; color:#1A1613; box-shadow:0 14px 30px -14px rgba(0,0,0,.6); }
.onb .bigbtn.quiet { background:rgba(255,255,255,.16); color:#fff; border:1px solid rgba(255,255,255,.26); }

@media (prefers-reduced-motion:reduce) { .nf *,.nf *::before,.nf *::after { animation:none !important; transition:none !important; } }
`;

/* ══════════════════════════════════════════════════════════════════ */
/*  MODEL                                                             */
/* ══════════════════════════════════════════════════════════════════ */

const KEY = "noteflow:v4";
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const shift = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d); };
const TODAY = () => dayKey();
const fmtFull = (k) => fromKey(k).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const fmtMed = (k) => fromKey(k).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtMonth = (k) => fromKey(k).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const dueLabel = (k) => {
  if (!k) return "No date";
  const t = TODAY();
  if (k === t) return "Today";
  if (k === shift(t, 1)) return "Tomorrow";
  if (k === shift(t, -1)) return "Yesterday";
  return fromKey(k).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const relTime = (ts) => {
  const m = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const d = Math.floor(m / 1440);
  if (d === 1) return "Yesterday";
  if (d < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: "long" });
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const words = (s) => (s?.trim() ? s.trim().split(/\s+/).length : 0);
const parseTags = (s) => [...new Set((s.match(/#[\p{L}\d_-]+/gu) || []).map((t) => t.slice(1)))].slice(0, 6);
const tap = () => { try { navigator.vibrate?.(8); } catch (e) { } };

const PRIORITIES = [
  { id: "high", label: "High", v: "var(--red)" },
  { id: "medium", label: "Medium", v: "var(--orange)" },
  { id: "low", label: "Low", v: "var(--teal)" },
];
const priOf = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
const SLOTS = [
  { id: "morning", label: "Morning", Icon: Sunrise },
  { id: "afternoon", label: "Afternoon", Icon: Sun },
  { id: "evening", label: "Evening", Icon: Sunset },
  { id: "anytime", label: "Anytime", Icon: Clock },
];
const slotOf = (id) => SLOTS.find((s) => s.id === id) || SLOTS[3];
const MOODS = [
  { id: "radiant", label: "Radiant", Icon: Sun, v: "var(--yellow)" },
  { id: "calm", label: "Calm", Icon: Leaf, v: "var(--green)" },
  { id: "focused", label: "Focused", Icon: Lightbulb, v: "#4F63C0" },
  { id: "tired", label: "Tired", Icon: Moon, v: "var(--label-3)" },
  { id: "heavy", label: "Heavy", Icon: CloudRain, v: "var(--teal)" },
];
const moodOf = (id) => MOODS.find((m) => m.id === id);
const WEATHER = [
  { id: "sunny", label: "Sunny", Icon: Sun }, { id: "cloudy", label: "Cloudy", Icon: Cloud },
  { id: "rainy", label: "Rainy", Icon: CloudRain }, { id: "clear", label: "Clear", Icon: CloudSun },
];
const weatherOf = (id) => WEATHER.find((w) => w.id === id);
/* A journal entry is just text. `answers` is the old prompt-based shape —
   read it so entries written before this change still open and display. */
const entryText = (e) => {
  if (!e) return "";
  if (typeof e.body === "string") return e.body;
  return Object.values(e.answers || {}).filter(Boolean).join("\n\n");
};

const TINTS = [
  { id: "plain", l: "#FFFFFF", d: "#1C1C1E" }, { id: "citrus", l: "#FFF4D6", d: "#3A3016" },
  { id: "blush", l: "#FFE6E4", d: "#3A2220" }, { id: "mint", l: "#DFF3E6", d: "#16301F" },
  { id: "sky", l: "#E2EDFB", d: "#16263A" }, { id: "lilac", l: "#EDE7FB", d: "#241E3A" },
];
const tintBg = (id, dark) => { const t = TINTS.find((x) => x.id === id) || TINTS[0]; return dark ? t.d : t.l; };
const EMOJIS = ["📝", "📚", "💡", "🎯", "🧭", "🌱", "🔥", "☕️", "🎧", "🧳"];

/* The Today screen wears the sky. Four moments, each with its own gradient,
   greeting and accent — so opening the app at 7am and 10pm feels different. */
const SKIES = {
  dawn: { from: "#E8926B", to: "#C4658C", accent: "#C4658C", soft: ["#FBEAE6", "#3A2320"], line: "The day is still folding open." },
  day: { from: "#5B9BE0", to: "#4A63C8", accent: "#4A63C8", soft: ["#E9EEFB", "#1C2242"], line: "Plenty of light left to use." },
  dusk: { from: "#D9705F", to: "#6B4A9E", accent: "#8156A8", soft: ["#F3EAF7", "#2B2140"], line: "Time to set things down." },
  night: { from: "#2A2C63", to: "#141530", accent: "#6C6FD4", soft: ["#EAEAF8", "#1E1F3D"], line: "The quiet part of the day." },
};
const skyNow = (h = new Date().getHours()) =>
  h < 6 ? SKIES.night : h < 9 ? SKIES.dawn : h < 17 ? SKIES.day : h < 20 ? SKIES.dusk : SKIES.night;

/* Each tab carries its own colour, so you know where you are without reading. */
const TAB_ACCENTS = {
  notes: { accent: "#BE7C17", soft: ["#FBF0DA", "#382C13"] },
  journal: { accent: "#96496F", soft: ["#FAE9F1", "#361F2C"] },
  planner: { accent: "#3F6FA8", soft: ["#E6EEF8", "#182534"] },
};
const accentFor = (tab, dark) => {
  const p = tab === "today" ? skyNow() : TAB_ACCENTS[tab];
  return { "--accent": p.accent, "--accent-soft": p.soft[dark ? 1 : 0] };
};

/* The NoteFlow mark — three ruled lines and a bead, matching the app icon. */
const Mark = ({ size = 18, stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6.5h16M4 12h12M4 17.5h7" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    <circle cx="18.5" cy="17.5" r="2.1" fill="currentColor" />
  </svg>
);


/* Export scheduled tasks as an .ics file — the standard calendar format, so
   they can be merged into Google Calendar, Apple Calendar or Outlook. */
const icsEscape = (v = "") => v.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
function buildICS(tasks) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NoteFlow//Planner//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:NoteFlow"];
  tasks.filter((t) => t.due).forEach((t) => {
    out.push(
      "BEGIN:VEVENT",
      `UID:${t.id}@noteflow.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${t.due.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${shift(t.due, 1).replace(/-/g, "")}`,
      `SUMMARY:${icsEscape((t.done ? "\u2713 " : "") + t.title)}`,
      `CATEGORIES:${priOf(t.priority).label} priority,${slotOf(t.slot).label}`,
      `STATUS:${t.done ? "CONFIRMED" : "TENTATIVE"}`
    );
    if (t.notes?.trim()) out.push(`DESCRIPTION:${icsEscape(t.notes.trim())}`);
    out.push("END:VEVENT");
  });
  out.push("END:VCALENDAR");
  return out.join("\r\n");
}
function downloadICS(tasks) {
  const scheduled = tasks.filter((t) => t.due);
  if (!scheduled.length) return 0;
  const blob = new Blob([buildICS(scheduled)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "noteflow-planner.ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return scheduled.length;
}


/* A note's display title: what you typed, else its opening line. */
const noteTitle = (n) => {
  if (n.title?.trim()) return n.title.trim();
  const first = (n.body || "").trim().split("\n")[0].trim();
  if (first) return first.slice(0, 60);
  const atts = (n.attachments || []).length;
  if (atts) return `${atts} ${atts === 1 ? "attachment" : "attachments"}`;
  if ((n.checklist || []).length) return "Checklist";
  return "New Note";
};
/* ...and the preview beneath it, minus whatever became the title. */
const notePreview = (n) => {
  const body = (n.body || "").trim();
  if (n.title?.trim()) return body;
  const nl = body.indexOf("\n");
  return nl === -1 ? "" : body.slice(nl + 1).trim();
};

const streakOf = (journal) => {
  let n = 0, k = TODAY();
  if (!journal[k]) k = shift(k, -1);
  while (journal[k]) { n++; k = shift(k, -1); }
  return n;
};

function sample() {
  const t = TODAY();
  return {
    notes: [
      {
        id: uid(), emoji: "💡", title: "Launch checklist", tint: "plain", pinned: true, archived: false,
        body: "Keep it calm. Nothing on screen that doesn't earn its place.",
        checklist: [{ id: uid(), text: "Rework the home screen", done: true }, { id: uid(), text: "Voice typing everywhere", done: true }, { id: uid(), text: "Journal timeline", done: false }],
        tags: ["Work", "Ideas"], createdAt: Date.now() - 3e8, updatedAt: Date.now() - 18e6,
      },
      { id: uid(), emoji: "📚", title: "Worth rereading", tint: "citrus", pinned: true, archived: false, body: "Excellence isn't an act, it's a habit. Same goes for rest — schedule it or it never happens.", checklist: [], tags: ["Reading"], createdAt: Date.now() - 4e8, updatedAt: Date.now() - 9e7 },
      { id: uid(), emoji: "🧳", title: "Munnar weekend", tint: "mint", pinned: false, archived: false, body: "Leave by six to beat the ghat traffic. Tea museum shuts at four. Carry a jacket — it drops to 12°C after sunset. #Travel", checklist: [], tags: ["Travel"], createdAt: Date.now() - 5e8, updatedAt: Date.now() - 1.7e8 },
      { id: uid(), emoji: "☕️", title: "Filter coffee ratio", tint: "blush", pinned: false, archived: false, body: "1:15 grounds to water, 92°C, four minutes. Decoction keeps two days, no longer.", checklist: [], tags: ["Kitchen"], createdAt: Date.now() - 7e8, updatedAt: Date.now() - 4e8 },
    ],
    tasks: [
      { id: uid(), title: "Review the design feedback", done: false, due: t, priority: "high", slot: "morning", notes: "", createdAt: Date.now() },
      { id: uid(), title: "Reply to the vendor email", done: false, due: t, priority: "medium", slot: "afternoon", notes: "", createdAt: Date.now() },
      { id: uid(), title: "Walk before dinner", done: true, due: t, priority: "low", slot: "evening", notes: "", createdAt: Date.now(), doneAt: Date.now() },
      { id: uid(), title: "Book the dentist", done: false, due: shift(t, 2), priority: "medium", slot: "anytime", notes: "", createdAt: Date.now() },
      { id: uid(), title: "Draft the quarterly summary", done: false, due: shift(t, 4), priority: "high", slot: "morning", notes: "", createdAt: Date.now() },
    ],
    journal: {
      [shift(t, -1)]: {
        body: "Finished the mockups early, then actually cooked instead of ordering in.\n\nThe thing I keep relearning: consistency beats intensity, every single time. Two focused hours today did more than last Sunday's six.\n\nLetting go of the meeting that went nowhere.",
        mood: "calm", energy: 4, weather: "clear", updatedAt: Date.now() - 864e5,
      },
      [shift(t, -2)]: {
        body: "Morning light through the kitchen window, a clear head, and a long call with Amma before anyone else was awake.\n\nWant to ship the first working build before lunch. Move slowly, finish properly.",
        mood: "radiant", energy: 5, weather: "sunny", updatedAt: Date.now() - 1728e5,
      },
    },
    prefs: { dark: false, onboarded: true, profile: { name: "", avatarId: null, since: Date.now() } },
  };
}
const blank = () => ({ notes: [], tasks: [], journal: {}, prefs: { dark: false, onboarded: true, profile: { name: "", avatarId: null, since: Date.now() } } });

function useStore() {
  const [data, setData] = useState(null);
  const [saveFailed, setSaveFailed] = useState(0);
  const dirty = useRef(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      let loaded = null;
      try { const r = await window.storage.get(KEY); loaded = r ? JSON.parse(r.value) : null; } catch (e) { }
      if (alive) setData(loaded && loaded.notes ? loaded : { ...blank(), prefs: { dark: false, onboarded: false, profile: { name: "", avatarId: null, since: Date.now() } } });
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!data || !dirty.current) return;
    const id = setTimeout(async () => {
      try { await window.storage.set(KEY, JSON.stringify(data)); }
      catch (e) { console.error("NoteFlow couldn't save", e); setSaveFailed((n) => n + 1); }
    }, 400);
    return () => clearTimeout(id);
  }, [data]);
  const update = useCallback((fn) => { dirty.current = true; setData((d) => fn(d)); }, []);
  return { data, update, saveFailed };
}

/* ══════════════════════════════════════════════════════════════════ */
/*  DICTATION                                                         */
/* ══════════════════════════════════════════════════════════════════ */

function useVoice() {
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = !!SR;
  const [field, setField] = useState(null);
  const [interim, setInterim] = useState("");
  const [problem, setProblem] = useState("");
  const rec = useRef(null); const sink = useRef(null);

  const stop = useCallback(() => {
    const r = rec.current; rec.current = null;
    if (r) { r.onend = null; r.onresult = null; try { r.stop(); } catch (e) { } }
    setField(null); setInterim("");
  }, []);

  const start = useCallback((id, onText) => {
    if (!supported) { setProblem("Dictation needs Safari, Chrome or Edge."); return; }
    if (rec.current) { const r = rec.current; rec.current = null; r.onend = null; try { r.stop(); } catch (e) { } }
    setProblem(""); tap();
    const r = new SR();
    r.continuous = true; r.interimResults = true;
    r.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    r.onresult = (ev) => {
      let done = "", live = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const txt = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) done += txt; else live += txt;
      }
      if (done.trim()) sink.current?.(done.trim());
      setInterim(live);
    };
    r.onerror = (ev) => {
      setProblem(ev.error === "not-allowed" || ev.error === "service-not-allowed"
        ? "Microphone access is off. Turn it on in your browser settings to dictate."
        : ev.error === "no-speech" ? "Didn't catch that — tap the mic and try again." : "Dictation stopped unexpectedly.");
      rec.current = null; setField(null); setInterim("");
    };
    r.onend = () => { if (rec.current === r) { rec.current = null; setField(null); setInterim(""); } };
    sink.current = onText; rec.current = r; setField(id);
    try { r.start(); } catch (e) { setProblem("Dictation couldn't start here."); setField(null); }
  }, [SR, supported]);

  const toggle = useCallback((id, onText) => { field === id ? stop() : start(id, onText); }, [field, start, stop]);
  useEffect(() => () => { try { rec.current?.stop(); } catch (e) { } }, []);
  return { supported, field, interim, problem, toggle, stop };
}

const join = (prev, add) => (prev?.trim() ? prev.replace(/\s*$/, "") + " " + add : add);

const Mic0 = ({ voice, id, onText, sm }) => {
  const on = voice.field === id;
  return (
    <button className={"mic" + (on ? " on" : "") + (sm ? " sm" : "")} onClick={() => voice.toggle(id, onText)}
      aria-label={on ? "Stop dictation" : "Start dictation"} title={voice.supported ? "Dictate" : "Dictation unavailable in this browser"}>
      {on ? <Square size={sm ? 10 : 12} fill="currentColor" /> : <Mic size={sm ? 15 : 17} />}
    </button>
  );
};

const DictationLine = ({ voice, id }) => {
  const on = voice.field === id;
  return (
    <>
      {on && (
        <div className="dictrow">
          <span className="wave" style={{ color: "var(--red)" }}><i /><i /><i /><i /></span>
          <span>{voice.interim || "Listening…"}</span>
        </div>
      )}
      {!on && voice.problem && <p className="dicterr">{voice.problem}</p>}
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
/*  ATTACHMENTS                                                       */
/* ══════════════════════════════════════════════════════════════════ */

/* Files live under their own storage keys rather than inside the main
   document, so opening the app never has to load every photo you ever
   attached. Notes and entries hold only the metadata. */
const ATT = "noteflow:att:";
const MAX_BYTES = 2_600_000;         // ~2.5 MB once base64-encoded

const putAttachment = async (id, dataUrl) => { await window.storage.set(ATT + id, dataUrl); };
const getAttachment = async (id) => {
  try { const r = await window.storage.get(ATT + id); return r?.value || null; } catch (e) { return null; }
};
const dropAttachment = async (id) => { try { await window.storage.delete(ATT + id); } catch (e) { } };
const dropAll = (items = []) => items.forEach((a) => dropAttachment(a.id));

const readFile = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = () => rej(new Error("read failed"));
  r.readAsDataURL(file);
});

/* Photos off a phone camera are far too big to keep as-is — resize and
   re-encode before storing, which takes a 4 MB shot down to ~200 KB. */
const shrinkImage = (file, max = 1400, quality = 0.72) => new Promise((res, rej) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";      // JPEG has no alpha; without this, transparency turns black
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    res({ dataUrl: c.toDataURL("image/jpeg", quality), w, h });
  };
  img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("not an image")); };
  img.src = url;
});

const prettySize = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* Turn picked files into stored attachments; returns the metadata to save. */
async function ingest(files, toast) {
  const made = [];
  for (const file of files) {
    const id = uid();
    try {
      if (file.type.startsWith("image/")) {
        const { dataUrl, w, h } = await shrinkImage(file);
        if (dataUrl.length > MAX_BYTES) { toast(`${file.name} is too large to store`); continue; }
        await putAttachment(id, dataUrl);
        made.push({ id, kind: "image", name: file.name, mime: "image/jpeg", size: Math.round(dataUrl.length * 0.75), w, h });
      } else {
        const dataUrl = await readFile(file);
        if (dataUrl.length > MAX_BYTES) { toast(`${file.name} is over 2.5 MB — too large to store`); continue; }
        await putAttachment(id, dataUrl);
        made.push({ id, kind: "file", name: file.name, mime: file.type || "application/octet-stream", size: file.size });
      }
    } catch (e) { toast(`Couldn't attach ${file.name}`); }
  }
  if (made.length) toast(`${made.length} ${made.length === 1 ? "attachment" : "attachments"} added`);
  return made;
}

async function openAttachment(att) {
  const data = await getAttachment(att.id);
  if (!data) return;
  const [meta, b64] = data.split(",");
  const mime = (meta.match(/:(.*?);/) || [])[1] || att.mime;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener"; a.download = att.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* Picker buttons — three routes in, because "gallery" and "camera" are
   different intentions even though the browser treats both as a file. */
function AttachButtons({ onPicked }) {
  const gallery = useRef(null), camera = useRef(null), files = useRef(null);
  const take = (e) => { const list = [...e.target.files]; e.target.value = ""; if (list.length) onPicked(list); };
  return (
    <div className="attbar">
      <button className="attbtn" onClick={() => gallery.current?.click()}><ImageIcon size={15} /> Photos</button>
      <button className="attbtn" onClick={() => camera.current?.click()}><Camera size={15} /> Camera</button>
      <button className="attbtn" onClick={() => files.current?.click()}><Paperclip size={15} /> Files</button>
      <input ref={gallery} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={take} />
      <input ref={camera} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={take} />
      <input ref={files} type="file" style={{ display: "none" }} onChange={take} />
    </div>
  );
}

function Thumb({ att, onOpen, onRemove }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true;
    if (att.kind === "image") getAttachment(att.id).then((v) => alive && setSrc(v));
    return () => { alive = false; };
  }, [att.id, att.kind]);

  if (att.kind === "image") {
    return (
      <div className="thumb">
        <button className="thumbhit" onClick={() => onOpen(att, src)} aria-label={`Open ${att.name}`}>
          {src ? <img src={src} alt={att.name} /> : <span className="thumbwait" />}
        </button>
        <button className="thumbx" onClick={() => onRemove(att)} aria-label={`Remove ${att.name}`}><X size={12} strokeWidth={3} /></button>
      </div>
    );
  }
  return (
    <div className="filechip">
      <button className="filehit" onClick={() => openAttachment(att)}>
        <div className="fileico"><FileText size={15} /></div>
        <div className="filemeta"><span className="fn">{att.name}</span><span className="fs">{prettySize(att.size)}</span></div>
        <Download size={14} color="var(--label-3)" />
      </button>
      <button className="thumbx flat" onClick={() => onRemove(att)} aria-label={`Remove ${att.name}`}><X size={12} strokeWidth={3} /></button>
    </div>
  );
}

function Attachments({ items = [], onAdd, onRemove, toast }) {
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const images = items.filter((a) => a.kind === "image");
  const docs = items.filter((a) => a.kind !== "image");
  return (
    <>
      <AttachButtons onPicked={async (files) => {
        setBusy(true);
        try { onAdd(await ingest(files, toast)); } finally { setBusy(false); }
      }} />
      {busy && <p className="attbusy">Processing…</p>}
      {images.length > 0 && (
        <div className="thumbs">
          {images.map((a) => <Thumb key={a.id} att={a} onOpen={(att, src) => setViewing({ att, src })} onRemove={onRemove} />)}
        </div>
      )}
      {docs.length > 0 && <div className="filelist">{docs.map((a) => <Thumb key={a.id} att={a} onRemove={onRemove} onOpen={() => { }} />)}</div>}
      {viewing && (
        <div className="lightbox" onClick={() => setViewing(null)}>
          <button className="lbclose" onClick={() => setViewing(null)} aria-label="Close"><X size={20} /></button>
          <button className="lbsave" onClick={(e) => { e.stopPropagation(); openAttachment(viewing.att); }} aria-label="Save image"><Download size={19} /></button>
          {viewing.src && <img src={viewing.src} alt={viewing.att.name} onClick={(e) => e.stopPropagation()} />}
          <span className="lbname">{viewing.att.name}</span>
        </div>
      )}
    </>
  );
}


/* ── profile ─────────────────────────────────────────────────────── */

const profileOf = (data) => data?.prefs?.profile || { name: "", avatarId: null, since: null };
const firstName = (data) => (profileOf(data).name || "").trim().split(/\s+/)[0] || "";

function Avatar({ id, name = "", size = 44 }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true;
    if (id) getAttachment(id).then((v) => alive && setSrc(v)); else setSrc(null);
    return () => { alive = false; };
  }, [id]);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}>
      {src ? <img src={src} alt="" /> : initials ? <span>{initials}</span> : <User size={Math.round(size * 0.46)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SHARED UI                                                         */
/* ══════════════════════════════════════════════════════════════════ */

const Group = ({ title, right, action, onAction, children, footer }) => (
  <>
    {(title || action) && (
      <div className="ghead">
        {title}
        {right && <span className="r">{right}</span>}
        {action && <button className="act" onClick={onAction}>{action}</button>}
      </div>
    )}
    <div className="list">{children}</div>
    {footer && <div className="gfoot">{footer}</div>}
  </>
);

const Blank = ({ Icon, title, text }) => (
  <div className="blank">
    <div className="ic"><Icon size={27} /></div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

function TaskItem({ task, onToggle, onOpen, showDate }) {
  return (
    <div className={"item inset" + (task.done ? " done" : "")}>
      <button className={"check" + (task.done ? " on" : "")} onClick={() => { tap(); onToggle(task.id); }}
        aria-label={task.done ? "Mark as not completed" : "Mark as completed"}>
        <Check size={14} strokeWidth={3.4} />
      </button>
      <button className="grow" onClick={() => onOpen?.(task)}>
        <div className="ttl">{task.title}</div>
        {!task.done && (
          <div className="metaline">
            {showDate && <span className={task.due && task.due < TODAY() ? "od" : ""}>{dueLabel(task.due)}</span>}
            <span>{slotOf(task.slot).label}</span>
            {task.notes?.trim() && <FileText size={12} />}
          </div>
        )}
      </button>
      {!task.done && task.priority !== "low" && <i className="pdot" style={{ background: priOf(task.priority).v }} />}
      {onOpen && <ChevronRight size={16} className="chev" />}
    </div>
  );
}

function NoteCard({ note, onOpen, dark, i = 0 }) {
  const items = note.checklist || [];
  const atts = note.attachments || [];
  const preview = notePreview(note);
  const done = items.filter((c) => c.done).length;
  return (
    <button className="ncard pop" style={{ background: tintBg(note.tint, dark), animationDelay: `${Math.min(i, 8) * 45}ms` }} onClick={() => onOpen(note)}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="em">{note.emoji || "📝"}</span>
        {note.pinned && <Pin size={12} color="var(--label-3)" fill="currentColor" style={{ marginLeft: "auto" }} />}
      </div>
      <h3>{noteTitle(note)}</h3>
      {preview && <p>{preview.slice(0, 96)}{preview.length > 96 ? "…" : ""}</p>}
      {items.length > 0 && (
        <div className="cl">
          {items.slice(0, 2).map((c) => (
            <div key={c.id} className={"ln" + (c.done ? " on" : "")}>
              <i className={"bx" + (c.done ? " on" : "")}>{c.done && <Check size={8} strokeWidth={4} />}</i>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      )}
      <div className="ft">
        {items.length > 0 ? <span>{done}/{items.length}</span> : <span>{relTime(note.updatedAt)}</span>}
        {atts.length > 0 && <span className="clip"><Paperclip size={11} />{atts.length}</span>}
        {(note.tags || [])[0] && <span className="tagpill">#{note.tags[0]}</span>}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TODAY                                                             */
/* ══════════════════════════════════════════════════════════════════ */

function Today({ data, update, go, openNote, openJournal, voice, toast }) {
  const t = TODAY();
  const [mode, setMode] = useState("task");
  const [text, setText] = useState("");
  const hour = new Date().getHours();
  const who = firstName(data);
  const timeGreeting = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hello = who ? `${timeGreeting}, ${who}` : timeGreeting;

  const todays = data.tasks.filter((x) => x.due === t);
  const doneCount = todays.filter((x) => x.done).length;
  const pending = data.tasks.filter((x) => !x.done && x.due && x.due <= t);
  const overdue = pending.filter((x) => x.due < t).length;
  const streak = streakOf(data.journal);
  const entry = data.journal[t];
  const notes = data.notes.filter((n) => !n.archived).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt).slice(0, 6);

  const pct = todays.length ? doneCount / todays.length : 0;
  const C = 2 * Math.PI * 31;
  const sky = skyNow(hour);

  const save = () => {
    const v = text.trim(); if (!v) return;
    voice.stop(); tap();
    if (mode === "task") {
      update((d) => ({ ...d, tasks: [{ id: uid(), title: v, done: false, due: t, priority: "medium", slot: hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening", notes: "", createdAt: Date.now() }, ...d.tasks] }));
      toast("Task added to Today");
    } else {
      update((d) => ({ ...d, notes: [{ id: uid(), emoji: "📝", title: v.split(/[.\n]/)[0].slice(0, 40), body: v, tint: "plain", pinned: false, archived: false, checklist: [], tags: parseTags(v), createdAt: Date.now(), updatedAt: Date.now() }, ...d.notes] }));
      toast("Note saved");
    }
    setText("");
  };
  const toggle = (id) => update((d) => ({ ...d, tasks: d.tasks.map((x) => x.id === id ? { ...x, done: !x.done, doneAt: Date.now() } : x) }));

  return (
    <>
      <div className="hero" style={{ background: `linear-gradient(158deg, ${sky.from}, ${sky.to})` }}>
        <h1 className="hi">{hello}.</h1>
        <p className="dt">{fmtFull(t)}</p>
        <div className="row">
          <div className="ring">
            <svg width="78" height="78">
              <circle cx="39" cy="39" r="31" fill="none" stroke="rgba(255,255,255,.26)" strokeWidth="7" />
              <circle cx="39" cy="39" r="31" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }} />
            </svg>
            <div className="mid">{Math.round(pct * 100)}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <p className="cap">{todays.length ? `${doneCount} of ${todays.length} done${overdue ? `, ${overdue} overdue` : ""}.` : sky.line}</p>
            <div className="chips">
              <span className="hchip"><Flame size={12} /> {streak} day streak</span>
              <span className="hchip">{data.notes.filter((n) => !n.archived).length} notes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sheetup">
      <div className="capture">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder={mode === "task" ? "What needs doing?" : "Jot something down"} aria-label="Quick capture" />
        <Mic0 voice={voice} id="capture" onText={(s) => setText((p) => join(p, s))} />
        {text.trim() && <button className="mic" style={{ background: "var(--accent)", color: "#fff" }} onClick={save} aria-label="Save"><ArrowUp size={16} strokeWidth={2.6} /></button>}
      </div>
      <div className="capseg">
        <button className={mode === "task" ? "on" : ""} onClick={() => setMode("task")}>Task</button>
        <button className={mode === "note" ? "on" : ""} onClick={() => setMode("note")}>Note</button>
        <span className="hint">{voice.field === "capture" ? (voice.interim || "Listening…") : voice.supported ? "or dictate" : ""}</span>
      </div>
      {voice.problem && voice.field !== "capture" && <p className="dicterr" style={{ padding: "0 16px" }}>{voice.problem}</p>}

      {pending.length > 0 ? (
        <Group title="Tasks" action="See All" onAction={() => go("planner")}>
          {pending.slice(0, 5).map((x) => <TaskItem key={x.id} task={x} onToggle={toggle} showDate={x.due < t} />)}
          {pending.length > 5 && (
            <button className="item" onClick={() => go("planner")}>
              <div className="grow" style={{ color: "var(--accent)", fontSize: 15, fontWeight: 600 }}>
                {pending.length - 5} more {pending.length - 5 === 1 ? "task" : "tasks"}
              </div>
              <ChevronRight size={16} className="chev" />
            </button>
          )}
        </Group>
      ) : (
        <Group title="Tasks" action="See All" onAction={() => go("planner")}>
          <div className="item" style={{ color: "var(--label-2)", fontSize: 15 }}>
            <Check size={17} color="var(--green)" />{todays.length ? "All done for today." : "Nothing scheduled."}
          </div>
        </Group>
      )}

      <Group title="Reflection">
        <button className="item inset" onClick={() => openJournal(t)}>
          <div className="sqico" style={{ background: "var(--accent)" }}><BookOpen size={16} /></div>
          <div className="grow">
            <div className="ttl">{entry ? "Continue today's entry" : "Write today's entry"}</div>
            <div className="sub">{entry ? `${words(entryText(entry))} words so far` : "A blank page. Write it or speak it."}</div>
          </div>
          <ChevronRight size={16} className="chev" />
        </button>
      </Group>

      <div className="ghead">Notes<button className="act" onClick={() => go("notes")}>See All</button></div>
      {notes.length ? (
        <div className="hstrip">{notes.map((n, i) => <NoteCard key={n.id} note={n} onOpen={openNote} dark={data.prefs.dark} i={i} />)}</div>
      ) : (
        <div className="list"><div className="item" style={{ color: "var(--label-2)", fontSize: 15 }}>No notes yet — tap + to add one.</div></div>
      )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  NOTES                                                             */
/* ══════════════════════════════════════════════════════════════════ */

function Notes({ data, openNote, voice }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(null);
  const [arch, setArch] = useState(false);

  const tags = useMemo(() => {
    const c = {};
    data.notes.filter((n) => !n.archived).forEach((n) => (n.tags || []).forEach((t) => (c[t] = (c[t] || 0) + 1)));
    return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 8);
  }, [data.notes]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.notes
      .filter((n) => (arch ? n.archived : !n.archived))
      .filter((n) => !tag || (n.tags || []).includes(tag))
      .filter((n) => !term || (n.title + n.body + (n.checklist || []).map((c) => c.text).join(" ")).toLowerCase().includes(term))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [data.notes, q, tag, arch]);

  const pinned = list.filter((n) => n.pinned);
  const rest = list.filter((n) => !n.pinned);
  const archCount = data.notes.filter((n) => n.archived).length;

  if (!data.notes.length) {
    return (
      <>
        <h1 className="large">Notes</h1>
        <Blank Icon={FileText} title="No Notes Yet" text="Ideas, checklists, quotes worth keeping. Everything you capture lands here." />
      </>
    );
  }

  return (
    <>
      <h1 className="large">Notes</h1>
      <div className="searchfield">
        <Search size={16} color="var(--label-3)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search notes" />
        <Mic0 voice={voice} id="notesSearch" sm onText={(s) => setQ((p) => join(p, s))} />
        {q && <button onClick={() => setQ("")} aria-label="Clear search"><X size={15} color="var(--label-3)" /></button>}
      </div>

      <div className="chiprow">
        <button className={"chip" + (!tag && !arch ? " on" : "")} onClick={() => { setTag(null); setArch(false); }}>All</button>
        {tags.map((t) => <button key={t} className={"chip" + (tag === t ? " on" : "")} onClick={() => { setArch(false); setTag(tag === t ? null : t); }}>#{t}</button>)}
        {archCount > 0 && <button className={"chip" + (arch ? " on" : "")} onClick={() => { setTag(null); setArch(!arch); }}><Archive size={13} /> Archived</button>}
      </div>

      {list.length === 0 ? (
        <Blank Icon={Search} title="No Results" text={arch ? "Nothing archived yet." : `Nothing matches ${q ? `“${q}”` : "that filter"}.`} />
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div className="ghead">Pinned</div>
              <div className="grid">{pinned.map((n, i) => <NoteCard key={n.id} note={n} onOpen={openNote} dark={data.prefs.dark} i={i} />)}</div>
            </>
          )}
          {rest.length > 0 && (
            <>
              <div className="ghead">{pinned.length ? "All Notes" : arch ? "Archived" : "Notes"}</div>
              <div className="grid">{rest.map((n, i) => <NoteCard key={n.id} note={n} onOpen={openNote} dark={data.prefs.dark} i={i} />)}</div>
            </>
          )}
          <p className="gfoot" style={{ textAlign: "center", paddingTop: 22 }}>{list.length} {list.length === 1 ? "Note" : "Notes"}</p>
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PLANNER                                                           */
/* ══════════════════════════════════════════════════════════════════ */

function Planner({ data, update, openTask, openJournal, voice, toast }) {
  const t = TODAY();
  const [view, setView] = useState("today");
  const [title, setTitle] = useState("");
  const [cursor, setCursor] = useState(() => { const d = fromKey(t); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [picked, setPicked] = useState(t);

  const toggle = (id) => update((d) => ({ ...d, tasks: d.tasks.map((x) => x.id === id ? { ...x, done: !x.done, doneAt: Date.now() } : x) }));
  const add = () => {
    const v = title.trim(); if (!v) return;
    voice.stop(); tap();
    const due = view === "calendar" ? picked : view === "upcoming" ? shift(t, 1) : t;
    update((d) => ({ ...d, tasks: [{ id: uid(), title: v, done: false, due, priority: "medium", slot: "anytime", notes: "", createdAt: Date.now() }, ...d.tasks] }));
    setTitle(""); toast(`Task added for ${dueLabel(due)}`);
  };

  const todays = data.tasks.filter((x) => x.due === t);
  const doneToday = todays.filter((x) => x.done).length;

  /* one pass over tasks, keyed by day — the calendar reads from this */
  const byDate = useMemo(() => {
    const map = {};
    data.tasks.forEach((x) => {
      if (!x.due) return;
      (map[x.due] ||= { open: 0, done: 0, urgent: false });
      x.done ? map[x.due].done++ : map[x.due].open++;
      if (!x.done && x.priority === "high") map[x.due].urgent = true;
    });
    return map;
  }, [data.tasks]);

  /* ── calendar view ─────────────────────────────────────────────── */
  if (view === "calendar") {
    const first = new Date(cursor.y, cursor.m, 1);
    const pad = first.getDay();
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells = [...Array(pad).fill(null), ...Array.from({ length: count }, (_, i) => dayKey(new Date(cursor.y, cursor.m, i + 1)))];
    while (cells.length % 7) cells.push(null);

    const move = (n) => {
      const d = new Date(cursor.y, cursor.m + n, 1);
      setCursor({ y: d.getFullYear(), m: d.getMonth() });
    };
    const dayTasks = data.tasks.filter((x) => x.due === picked).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));
    const dayEntry = data.journal[picked];

    return (
      <>
        <h1 className="large">Planner</h1>
        <p className="subhead"><i className="bead" />{doneToday} of {todays.length} complete today</p>

        <div className="segmented">
          {[["today", "Today"], ["upcoming", "Upcoming"], ["calendar", "Calendar"], ["done", "Done"]].map(([id, l]) => (
            <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>{l}</button>
          ))}
        </div>

        <div className="cal">
          <div className="calbar">
            <button className="calnav" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={19} /></button>
            <h3>{first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
            <button className="calnav" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={19} /></button>
            <button className="caltoday" onClick={() => { const d = fromKey(t); setCursor({ y: d.getFullYear(), m: d.getMonth() }); setPicked(t); }}>Today</button>
          </div>

          <div className="caldow">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="calgrid">
            {cells.map((k, i) => {
              if (!k) return <span key={i} />;
              const info = byDate[k];
              const j = data.journal[k];
              return (
                <button key={k} className={"cell" + (k === t ? " today" : "") + (k === picked ? " on" : "")} onClick={() => { tap(); setPicked(k); }}>
                  <span className="n">{fromKey(k).getDate()}</span>
                  <span className="cdots">
                    {info?.open > 0 && <i style={{ background: info.urgent ? "var(--red)" : "var(--accent)" }} />}
                    {info && info.open === 0 && info.done > 0 && <i style={{ background: "var(--green)" }} />}
                    {j && <i style={{ background: "var(--orange)" }} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="callegend">
            <span><i style={{ background: "var(--accent)" }} /> Tasks</span>
            <span><i style={{ background: "var(--green)" }} /> All done</span>
            <span><i style={{ background: "var(--orange)" }} /> Journal</span>
          </div>
        </div>

        <div className="capture" style={{ marginTop: 16 }}>
          <Plus size={17} color="var(--label-3)" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={`Add to ${dueLabel(picked)}`} aria-label="New task" />
          <Mic0 voice={voice} id="plannerAdd" sm onText={(str) => setTitle((p) => join(p, str))} />
          {title.trim() && <button className="mic sm" style={{ background: "var(--accent)", color: "#fff" }} onClick={add} aria-label="Add task"><ArrowUp size={15} strokeWidth={2.6} /></button>}
        </div>
        <div className="pad"><DictationLine voice={voice} id="plannerAdd" /></div>

        {dayEntry && (
          <Group title="Journal">
            <button className="item inset" onClick={() => openJournal(picked)}>
              <i className="mdot" style={{ background: moodOf(dayEntry.mood)?.v || "var(--label-4)", width: 11, height: 11, borderRadius: 6 }} />
              <div className="grow">
                <div className="ttl">{words(entryText(dayEntry))} words written</div>
                <div className="jsnip">{entryText(dayEntry).replace(/\s+/g, " ").slice(0, 70)}…</div>
              </div>
              <ChevronRight size={16} className="chev" />
            </button>
          </Group>
        )}

        {dayTasks.length ? (
          <Group title={fmtMed(picked)} right={`${dayTasks.filter((x) => !x.done).length} open`}>
            {dayTasks.map((x) => <TaskItem key={x.id} task={x} onToggle={toggle} onOpen={openTask} />)}
          </Group>
        ) : (
          <Blank Icon={CalendarDays} title="Nothing on this day"
            text={`${fmtFull(picked)} is clear. Add something above, or tap another date.`} />
        )}
      </>
    );
  }

  /* ── list views ────────────────────────────────────────────────── */
  const list = view === "today" ? data.tasks.filter((x) => !x.done && x.due && x.due <= t)
    : view === "upcoming" ? data.tasks.filter((x) => !x.done && (!x.due || x.due > t))
      : [...data.tasks.filter((x) => x.done)].sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));

  const groups = view === "today"
    ? [{ key: "od", label: "Overdue", items: list.filter((x) => x.due < t) }, ...SLOTS.map((sl) => ({ key: sl.id, label: sl.label, items: list.filter((x) => x.due === t && x.slot === sl.id) }))].filter((g) => g.items.length)
    : view === "upcoming"
      ? [...new Set(list.map((x) => x.due || "none"))].sort().map((k) => ({ key: k, label: k === "none" ? "No Date" : dueLabel(k), items: list.filter((x) => (x.due || "none") === k) }))
      : [{ key: "done", label: "Completed", items: list.slice(0, 50) }];

  return (
    <>
      <h1 className="large">Planner</h1>
      <p className="subhead"><i className="bead" />{doneToday} of {todays.length} complete today</p>

      <div className="segmented">
        {[["today", "Today"], ["upcoming", "Upcoming"], ["calendar", "Calendar"], ["done", "Done"]].map(([id, l]) => (
          <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>{l}</button>
        ))}
      </div>

      <div className="capture" style={{ marginTop: 14 }}>
        <Plus size={17} color="var(--label-3)" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a task" aria-label="New task" />
        <Mic0 voice={voice} id="plannerAdd" sm onText={(str) => setTitle((p) => join(p, str))} />
        {title.trim() && <button className="mic sm" style={{ background: "var(--accent)", color: "#fff" }} onClick={add} aria-label="Add task"><ArrowUp size={15} strokeWidth={2.6} /></button>}
      </div>
      <div className="pad"><DictationLine voice={voice} id="plannerAdd" /></div>

      {groups.length ? groups.map((g) => (
        <Group key={g.key} title={g.label} right={`${g.items.length}`}>
          {g.items.map((x) => <TaskItem key={x.id} task={x} onToggle={toggle} onOpen={openTask} showDate={view !== "today" || g.key === "od"} />)}
        </Group>
      )) : (
        <Blank Icon={CheckSquare} title={view === "done" ? "Nothing Completed Yet" : "All Clear"}
          text={view === "done" ? "Tasks you finish will be collected here." : "Nothing in this list. Add something above, by typing or by voice."} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  JOURNAL                                                           */
/* ══════════════════════════════════════════════════════════════════ */

function Journal({ data, openJournal }) {
  const t = TODAY();
  const [mood, setMood] = useState(null);
  const streak = streakOf(data.journal);
  let keys = Object.keys(data.journal).sort((a, b) => b.localeCompare(a));
  if (mood) keys = keys.filter((k) => data.journal[k].mood === mood);

  const months = [];
  keys.forEach((k) => {
    const m = fmtMonth(k);
    const last = months[months.length - 1];
    if (last && last.m === m) last.keys.push(k); else months.push({ m, keys: [k] });
  });

  const written = Object.keys(data.journal).length;

  return (
    <>
      <h1 className="large">Journal</h1>
      <p className="subhead"><i className="bead" />{written} {written === 1 ? "entry" : "entries"}{streak ? ` · ${streak} day streak` : ""}</p>

      <Group>
        <button className="item inset" onClick={() => openJournal(t)}>
          <div className="sqico" style={{ background: "var(--accent)" }}><PenLine size={16} /></div>
          <div className="grow">
            <div className="ttl">{data.journal[t] ? "Continue Today's Entry" : "Write Today's Entry"}</div>
            <div className="sub">{fmtFull(t)}</div>
          </div>
          <ChevronRight size={16} className="chev" />
        </button>
      </Group>

      {written > 0 && (
        <div className="chiprow">
          <button className={"chip" + (!mood ? " on" : "")} onClick={() => setMood(null)}>All moods</button>
          {MOODS.map((m) => (
            <button key={m.id} className={"chip" + (mood === m.id ? " on" : "")} onClick={() => setMood(mood === m.id ? null : m.id)}>
              <m.Icon size={13} color={mood === m.id ? "#fff" : m.v} /> {m.label}
            </button>
          ))}
        </div>
      )}

      {keys.length === 0 ? (
        <Blank Icon={BookOpen} title={mood ? "No Matching Entries" : "Your Journal Is Empty"}
          text={mood ? "No entries recorded with that mood yet." : "Write freely about the day — or speak it, and let it type itself."} />
      ) : months.map((mo) => (
        <Group key={mo.m} title={mo.m} right={`${mo.keys.length}`}>
          {mo.keys.map((k) => {
            const e = data.journal[k];
            const m = moodOf(e.mood);
            const text = entryText(e).replace(/\s+/g, " ").trim();
            const n = words(entryText(e));
            return (
              <button className="item inset jrow" key={k} onClick={() => openJournal(k)}>
                <i className="mdot" style={{ background: m ? m.v : "var(--label-4)" }} />
                <div className="grow">
                  <div className="ttl" style={{ fontWeight: 600, fontSize: 15.5 }}>
                    {k === t ? "Today" : fmtMed(k)} <span style={{ fontWeight: 400, color: "var(--label-2)", fontSize: 14 }}>· {n} {n === 1 ? "word" : "words"}</span>
                  </div>
                  <div className="jsnip">{text ? text.slice(0, 96) + (text.length > 96 ? "…" : "") : "No words yet."}</div>
                  <div className="metaline">
                    {m && <span style={{ color: m.v, fontWeight: 500 }}>{m.label}</span>}
                    {e.energy > 0 && <span>Energy {e.energy}/5</span>}
                    {weatherOf(e.weather) && <span>{weatherOf(e.weather).label}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="chev" />
              </button>
            );
          })}
        </Group>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  NOTE EDITOR                                                       */
/* ══════════════════════════════════════════════════════════════════ */

function NoteEditor({ note, dark, voice, onSave, onDelete, onClose, toast, confirm }) {
  const [n, setN] = useState(note);
  const [showOpts, setShowOpts] = useState(false);
  const dirty = useRef(false);
  const finished = useRef(false);
  const latest = useRef(n);
  latest.current = n;
  const set = (p) => { dirty.current = true; setN((x) => ({ ...x, ...p })); };
  const ref = useRef(null);
  useEffect(() => { if (!note.title && !note.body) setTimeout(() => ref.current?.focus(), 340); }, []);

  const persist = () => {
    const c = latest.current;
    const empty = !c.title.trim() && !c.body.trim() && !(c.checklist || []).some((i) => i.text.trim()) && !(c.attachments || []).length;
    if (empty) { onDelete(c.id, true); return; }
    onSave({ ...c, title: c.title.trim(), checklist: (c.checklist || []).filter((i) => i.text.trim()), tags: [...new Set([...(c.tags || []), ...parseTags(c.body + " " + c.title)])].slice(0, 6), updatedAt: Date.now() });
  };
  const commit = () => { voice.stop(); finished.current = true; persist(); onClose(); };

  /* Dismissed by the hardware back button rather than Done — keep the work. */
  useEffect(() => () => { if (!finished.current && dirty.current) persist(); }, []);
  const setCheck = (id, p) => set({ checklist: n.checklist.map((c) => c.id === id ? { ...c, ...p } : c) });

  return (
    <div className="cover" style={{ background: tintBg(n.tint, dark) }}>
      <div className="coverbar" style={{ background: "transparent", boxShadow: "none" }}>
        <button className="navbtn" onClick={commit} aria-label="Back to Notes"><ChevronLeft size={21} strokeWidth={2.6} style={{ marginRight: -1 }} /><span className="navtext">Notes</span></button>
        <div style={{ flex: 1 }} />
        <button className="navbtn" onClick={() => { tap(); set({ pinned: !n.pinned }); }} aria-label={n.pinned ? "Unpin note" : "Pin note"}>
          {n.pinned ? <Pin size={19} fill="currentColor" /> : <PinOff size={19} />}
        </button>
        <button className="navbtn" onClick={() => setShowOpts(true)} aria-label="More options"><MoreHorizontal size={20} /></button>
        <button className="navbtn" onClick={commit}><span className="navtext bold">Done</span></button>
      </div>

      <div className="coverbody">
        <div className="pad">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <button style={{ fontSize: 26, lineHeight: 1 }} onClick={() => set({ emoji: EMOJIS[(EMOJIS.indexOf(n.emoji) + 1) % EMOJIS.length] })} aria-label="Change note icon">{n.emoji || "📝"}</button>
            <input ref={ref} className="titlein" value={n.title} onChange={(e) => set({ title: e.target.value })} placeholder="Title" />
          </div>
          <textarea className="bodyin" value={n.body} onChange={(e) => set({ body: e.target.value })} placeholder="Start writing. Add #tags anywhere and they become filters." />
          <div className="dictrow">
            <Mic0 voice={voice} id="noteBody" onText={(s) => set({ body: join(n.body, s) })} />
            <span>{voice.field === "noteBody" ? (voice.interim || "Listening…") : voice.supported ? "Dictate this note" : "Dictation unavailable here"}</span>
          </div>
          {voice.problem && voice.field !== "noteBody" && <p className="dicterr">{voice.problem}</p>}
        </div>

        <Group title="Checklist" action="Add Item" onAction={() => set({ checklist: [...(n.checklist || []), { id: uid(), text: "", done: false }] })}>
          {(n.checklist || []).length === 0 && <div className="item" style={{ color: "var(--label-2)", fontSize: 15 }}>No items yet.</div>}
          {(n.checklist || []).map((c) => (
            <div className="item inset" key={c.id}>
              <button className={"check" + (c.done ? " on" : "")} onClick={() => { tap(); setCheck(c.id, { done: !c.done }); }} aria-label="Toggle item"><Check size={13} strokeWidth={3.4} /></button>
              <input className="grow" value={c.text} onChange={(e) => setCheck(c.id, { text: e.target.value })} placeholder="Item"
                style={c.done ? { textDecoration: "line-through", color: "var(--label-3)" } : undefined} />
              <Mic0 voice={voice} id={"chk" + c.id} sm onText={(s) => setCheck(c.id, { text: join(c.text, s) })} />
              <button onClick={() => set({ checklist: n.checklist.filter((x) => x.id !== c.id) })} aria-label="Remove item"><X size={16} color="var(--label-3)" /></button>
            </div>
          ))}
        </Group>

        <div className="ghead">Attachments</div>
        <div className="pad">
          <Attachments
            items={n.attachments || []}
            toast={toast}
            onAdd={(made) => made.length && set({ attachments: [...(n.attachments || []), ...made] })}
            onRemove={(att) => { dropAttachment(att.id); set({ attachments: (n.attachments || []).filter((a) => a.id !== att.id) }); }}
          />
        </div>

        <div className="ghead">Tags</div>
        <div className="pad">
          <div className="opts">
            {(n.tags || []).map((t) => <button key={t} className="opt" onClick={() => set({ tags: n.tags.filter((x) => x !== t) })}>#{t} <X size={12} /></button>)}
            <input style={{ width: 110, fontSize: 14, background: "var(--card)", borderRadius: 11, padding: "8px 12px" }} placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  set({ tags: [...new Set([...(n.tags || []), e.currentTarget.value.trim().replace(/^#/, "")])].slice(0, 6) });
                  e.currentTarget.value = "";
                }
              }} />
          </div>
        </div>

        <div className="ghead">Paper</div>
        <div className="pad" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TINTS.map((tt) => (
            <button key={tt.id} className={"swatch" + (n.tint === tt.id ? " on" : "")} style={{ background: tintBg(tt.id, dark) }} onClick={() => { tap(); set({ tint: tt.id }); }} aria-label={`${tt.id} paper`} />
          ))}
        </div>

        <p className="gfoot" style={{ textAlign: "center", paddingTop: 26 }}>
          {words(n.body)} words · Edited {relTime(n.updatedAt)}
        </p>
      </div>

      {showOpts && (
        <>
          <div className="veil" onClick={() => setShowOpts(false)} />
          <div className="sheet">
            <div className="grab" />
            <div style={{ padding: "16px 0 26px" }}>
              <Group>
                <button className="item inset" onClick={async () => {
                  try { await navigator.clipboard.writeText(`${n.title}\n\n${n.body}`); toast("Copied to clipboard"); }
                  catch (e) { toast("Couldn't copy here"); }
                  setShowOpts(false);
                }}>
                  <div className="sqico" style={{ background: "var(--label-3)" }}><Copy size={15} /></div>
                  <div className="grow"><div className="ttl">Copy Note</div></div>
                </button>
                <button className="item inset" onClick={() => { finished.current = true; onSave({ ...n, archived: !n.archived, updatedAt: Date.now() }); setShowOpts(false); onClose(); toast(n.archived ? "Moved to Notes" : "Moved to Archive"); }}>
                  <div className="sqico" style={{ background: "var(--orange)" }}><Archive size={15} /></div>
                  <div className="grow"><div className="ttl">{n.archived ? "Unarchive" : "Archive"}</div></div>
                </button>
                <button className="item inset" onClick={() => {
                  setShowOpts(false);
                  confirm({
                    title: "Delete Note?", message: "This note will be removed. You can undo right after.",
                    danger: "Delete", onConfirm: () => { finished.current = true; onDelete(n.id); onClose(); },
                  });
                }}>
                  <div className="sqico" style={{ background: "var(--red)" }}><Trash2 size={15} /></div>
                  <div className="grow"><div className="ttl" style={{ color: "var(--red)" }}>Delete Note</div></div>
                </button>
              </Group>
              <div className="pad" style={{ marginTop: 18 }}>
                <button className="bigbtn wide quiet" onClick={() => setShowOpts(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  JOURNAL EDITOR                                                    */
/* ══════════════════════════════════════════════════════════════════ */

function JournalEditor({ dateKey, entry, voice, onSave, onDelete, onClose, confirm, toast }) {
  const [e, setE] = useState(entry);
  const [showDetails, setShowDetails] = useState(!!(entry.mood || entry.energy || entry.weather));
  const dirty = useRef(false);
  const finished = useRef(false);
  const latest = useRef(e);
  latest.current = e;
  const set = (p) => { dirty.current = true; setE((x) => ({ ...x, ...p })); };
  const area = useRef(null);
  useEffect(() => { setTimeout(() => area.current?.focus(), 430); }, []);

  /* Back button instead of Done — a half-written entry is still worth keeping. */
  useEffect(() => () => {
    if (finished.current || !dirty.current) return;
    const c = latest.current;
    if (!c.body.trim() && !c.mood && !c.energy && !c.weather && !(c.attachments || []).length) {
      if (c.exists) onDelete(dateKey);
      return;
    }
    onSave(dateKey, { ...c, updatedAt: Date.now() });
  }, []);

  const count = words(e.body);
  const dictating = voice.field === "journal";

  const save = () => {
    voice.stop();
    finished.current = true;
    if (!e.body.trim() && !e.mood && !e.energy && !e.weather && !(e.attachments || []).length) {
      if (e.exists) onDelete(dateKey);
      onClose(); return;
    }
    onSave(dateKey, { ...e, updatedAt: Date.now() });
    onClose();
    toast(e.exists ? "Entry updated" : "Entry saved");
  };

  return (
    <div className="cover">
      <div className="coverbar">
        <button className="navbtn" onClick={() => { voice.stop(); finished.current = true; onClose(); }}><span className="navtext">Cancel</span></button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--display)", fontSize: 17, fontWeight: 600 }}>
          {dateKey === TODAY() ? "Today" : fmtMed(dateKey)}
        </div>
        <button className="navbtn" onClick={save}><span className="navtext bold">Done</span></button>
      </div>

      <div className="coverbody" style={{ paddingTop: 0 }}>
        <div className="pad">
          <p className="jdate">{fmtFull(dateKey)}</p>
          <textarea
            ref={area}
            className="jpage"
            value={e.body}
            onChange={(ev) => set({ body: ev.target.value })}
            placeholder="Write whatever's there. No prompts, no structure — just the day as you found it."
            aria-label="Journal entry"
          />
        </div>

        <div className="pad" style={{ marginTop: 4 }}>
          <Attachments
            items={e.attachments || []}
            toast={toast}
            onAdd={(made) => made.length && set({ attachments: [...(e.attachments || []), ...made] })}
            onRemove={(att) => { dropAttachment(att.id); set({ attachments: (e.attachments || []).filter((a) => a.id !== att.id) }); }}
          />
        </div>

        {!showDetails && (
          <div className="pad">
            <button className="addmood" onClick={() => setShowDetails(true)}>
              <Plus size={14} /> Add mood, energy or weather
            </button>
          </div>
        )}

        {showDetails && (
          <>
            <div className="ghead">How the day felt</div>
            <div className="pad">
              <div className="moodpick">
                {MOODS.map((m) => (
                  <button key={m.id} className={"moodbtn" + (e.mood === m.id ? " on" : "")}
                    style={e.mood === m.id ? { background: m.v } : undefined}
                    onClick={() => { tap(); set({ mood: e.mood === m.id ? null : m.id }); }}>
                    <i><m.Icon size={19} color={e.mood === m.id ? "#fff" : m.v} /></i>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <Group>
              <div className="item">
                <div className="grow"><div className="ttl">Energy</div></div>
                <div className="dots">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} className={"edot" + (e.energy >= v ? " on" : "")} onClick={() => { tap(); set({ energy: e.energy === v ? 0 : v }); }}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="item">
                <div className="grow"><div className="ttl">Weather</div></div>
                <div className="opts">
                  {WEATHER.map((w) => (
                    <button key={w.id} className={"opt" + (e.weather === w.id ? " on" : "")}
                      style={{ background: e.weather === w.id ? "var(--accent)" : "var(--fill)", padding: "8px 11px" }}
                      onClick={() => set({ weather: e.weather === w.id ? null : w.id })} aria-label={w.label}><w.Icon size={15} /></button>
                  ))}
                </div>
              </div>
            </Group>
          </>
        )}

        {e.exists && (
          <div className="pad" style={{ marginTop: 26 }}>
            <button className="bigbtn wide quiet" style={{ color: "var(--red)" }}
              onClick={() => confirm({ title: "Delete Entry?", message: "This journal entry will be removed permanently.", danger: "Delete", onConfirm: () => { finished.current = true; onDelete(dateKey); onClose(); toast("Entry deleted"); } })}>
              Delete Entry
            </button>
          </div>
        )}
      </div>

      <div className="writebar">
        <Mic0 voice={voice} id="journal" onText={(str) => set({ body: join(e.body, str) })} />
        <span className="wc">
          {dictating ? (
            <><span className="wave" style={{ color: "var(--red)" }}><i /><i /><i /><i /></span>
              <em>{voice.interim || "Listening…"}</em></>
          ) : voice.problem ? <em style={{ color: "var(--red)" }}>{voice.problem}</em>
            : `${count} ${count === 1 ? "word" : "words"}`}
        </span>
        <button className="bigbtn" style={{ margin: 0, padding: "9px 18px", fontSize: 15 }} onClick={save}>Done</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TASK EDITOR                                                       */
/* ══════════════════════════════════════════════════════════════════ */

function TaskEditor({ task, voice, onSave, onDelete, onClose, confirm, toast }) {
  const [t, setT] = useState(task);
  const dirty = useRef(false);
  const finished = useRef(false);
  const latest = useRef(t);
  latest.current = t;
  const set = (p) => { dirty.current = true; setT((x) => ({ ...x, ...p })); };
  const ref = useRef(null);
  useEffect(() => { if (!task.title) setTimeout(() => ref.current?.focus(), 340); }, []);
  const save = () => {
    voice.stop();
    finished.current = true;
    if (!t.title.trim()) { onClose(); return; }
    onSave({ ...t, title: t.title.trim() }); onClose(); toast(task.title ? "Task updated" : "Task added");
  };

  /* Dismissed by back — keep it if it has a name. */
  useEffect(() => () => {
    if (finished.current || !dirty.current) return;
    const c = latest.current;
    if (c.title.trim()) onSave({ ...c, title: c.title.trim() });
  }, []);

  return (
    <div className="cover">
      <div className="coverbar">
        <button className="navbtn" onClick={() => { voice.stop(); finished.current = true; onClose(); }}><span className="navtext">Cancel</span></button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600 }}>{task.title ? "Task" : "New Task"}</div>
        <button className="navbtn" onClick={save}><span className="navtext bold">Done</span></button>
      </div>

      <div className="coverbody">
        <Group>
          <div className="item">
            <input ref={ref} className="grow" value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="Task name" style={{ fontSize: 17 }} />
            <Mic0 voice={voice} id="taskTitle" sm onText={(s) => set({ title: join(t.title, s) })} />
          </div>
          <div className="item" style={{ alignItems: "flex-start" }}>
            <textarea className="grow" style={{ minHeight: 62, resize: "none", fontSize: 16, lineHeight: 1.5, paddingTop: 2 }}
              value={t.notes || ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Notes" />
            <Mic0 voice={voice} id="taskNotes" sm onText={(s) => set({ notes: join(t.notes || "", s) })} />
          </div>
        </Group>
        <div className="pad"><DictationLine voice={voice} id={voice.field === "taskNotes" ? "taskNotes" : "taskTitle"} /></div>

        <Group title="Priority">
          {PRIORITIES.map((p) => (
            <button className="item inset" key={p.id} onClick={() => { tap(); set({ priority: p.id }); }}>
              <i className="pdot" style={{ background: p.v, width: 10, height: 10, borderRadius: 5 }} />
              <div className="grow"><div className="ttl">{p.label}</div></div>
              {t.priority === p.id && <Check size={17} color="var(--accent)" strokeWidth={3} />}
            </button>
          ))}
        </Group>

        <Group title="Time of Day">
          {SLOTS.map((s) => (
            <button className="item inset" key={s.id} onClick={() => { tap(); set({ slot: s.id }); }}>
              <div className="sqico" style={{ background: "var(--label-3)" }}><s.Icon size={15} /></div>
              <div className="grow"><div className="ttl">{s.label}</div></div>
              {t.slot === s.id && <Check size={17} color="var(--accent)" strokeWidth={3} />}
            </button>
          ))}
        </Group>

        <Group title="Date" footer="Tasks with no date stay in Upcoming until you schedule them.">
          <div className="item" style={{ flexWrap: "wrap", gap: 8 }}>
            <div className="opts">
              {[[TODAY(), "Today"], [shift(TODAY(), 1), "Tomorrow"], [shift(TODAY(), 7), "Next Week"], [null, "None"]].map(([k, l]) => (
                <button key={l} className={"opt" + (t.due === k ? " on" : "")} style={{ background: t.due === k ? "var(--accent)" : "var(--fill)" }} onClick={() => set({ due: k })}>{l}</button>
              ))}
            </div>
          </div>
          <div className="item">
            <div className="grow"><div className="ttl">Pick a date</div></div>
            <input type="date" value={t.due || ""} onChange={(e) => set({ due: e.target.value || null })}
              style={{ width: "auto", color: "var(--accent)", fontSize: 15 }} aria-label="Task date" />
          </div>
        </Group>

        {task.title && (
          <div className="pad" style={{ marginTop: 22 }}>
            <button className="bigbtn wide quiet" style={{ color: "var(--red)" }}
              onClick={() => confirm({ title: "Delete Task?", message: "This task will be removed. You can undo right after.", danger: "Delete", onConfirm: () => { finished.current = true; onDelete(t.id); onClose(); } })}>
              Delete Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SEARCH, SETTINGS, CREATE, ONBOARDING                              */
/* ══════════════════════════════════════════════════════════════════ */

function SearchPage({ data, voice, onClose, openNote, openJournal, openTask, go }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 340); }, []);
  const term = q.trim().toLowerCase();
  const notes = term ? data.notes.filter((n) => (n.title + n.body + (n.tags || []).join(" ")).toLowerCase().includes(term)).slice(0, 8) : [];
  const tasks = term ? data.tasks.filter((t) => t.title.toLowerCase().includes(term)).slice(0, 8) : [];
  const js = term ? Object.keys(data.journal).filter((k) => entryText(data.journal[k]).toLowerCase().includes(term)).slice(0, 6) : [];
  const none = term && !notes.length && !tasks.length && !js.length;

  return (
    <div className="cover">
      <div className="coverbar">
        <div className="searchfield" style={{ flex: 1, margin: 0 }}>
          <Search size={16} color="var(--label-3)" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Notes, tasks, journal" aria-label="Search everything" />
          <Mic0 voice={voice} id="search" sm onText={(s) => setQ((p) => join(p, s))} />
        </div>
        <button className="navbtn" onClick={() => { voice.stop(); onClose(); }}><span className="navtext">Cancel</span></button>
      </div>
      <div className="coverbody">
        {!term && <p className="gfoot" style={{ padding: "20px 18px", fontSize: 14.5 }}>Search across everything you've captured. You can dictate the query too.</p>}
        {none && <Blank Icon={Search} title="No Results" text={`Nothing matches “${q}”.`} />}
        {notes.length > 0 && (
          <Group title="Notes" right={`${notes.length}`}>
            {notes.map((n) => (
              <button className="item inset" key={n.id} onClick={() => { onClose(); openNote(n); }}>
                <span style={{ fontSize: 19 }}>{n.emoji}</span>
                <div className="grow"><div className="ttl">{noteTitle(n)}</div><div className="sub">{(notePreview(n) || n.body).slice(0, 60)}</div></div>
                <ChevronRight size={16} className="chev" />
              </button>
            ))}
          </Group>
        )}
        {tasks.length > 0 && (
          <Group title="Tasks" right={`${tasks.length}`}>
            {tasks.map((t) => (
              <button className="item inset" key={t.id} onClick={() => { onClose(); openTask(t); }}>
                <i className="pdot" style={{ background: priOf(t.priority).v, width: 9, height: 9 }} />
                <div className="grow"><div className="ttl">{t.title}</div><div className="sub">{t.done ? "Completed" : `${dueLabel(t.due)} · ${slotOf(t.slot).label}`}</div></div>
                <ChevronRight size={16} className="chev" />
              </button>
            ))}
          </Group>
        )}
        {js.length > 0 && (
          <Group title="Journal" right={`${js.length}`}>
            {js.map((k) => (
              <button className="item inset" key={k} onClick={() => { onClose(); openJournal(k); }}>
                <i className="mdot" style={{ background: moodOf(data.journal[k].mood)?.v || "var(--label-4)", width: 10, height: 10, borderRadius: 5 }} />
                <div className="grow"><div className="ttl">{fmtMed(k)}</div><div className="sub">{entryText(data.journal[k]).slice(0, 60)}</div></div>
                <ChevronRight size={16} className="chev" />
              </button>
            ))}
          </Group>
        )}
      </div>
    </div>
  );
}

function ProfilePage({ data, update, onClose, confirm, toast }) {
  const p = profileOf(data);
  const [name, setName] = useState(p.name || "");
  const pick = useRef(null);
  const notes = data.notes.filter((n) => !n.archived).length;
  const entries = Object.keys(data.journal).length;
  const done = data.tasks.filter((t) => t.done).length;
  const streak = streakOf(data.journal);

  /* Last seven days, so the page says something even on a quiet week. */
  const weekAgo = Date.now() - 7 * 864e5;
  const weekWords = Object.entries(data.journal)
    .filter(([k]) => fromKey(k).getTime() >= weekAgo)
    .reduce((n, [, e]) => n + words(entryText(e)), 0);
  const weekNotes = data.notes.filter((n) => n.createdAt >= weekAgo).length;
  const weekTasks = data.tasks.filter((t) => t.done && (t.doneAt || 0) >= weekAgo).length;

  const setProfile = (patch) => update((d) => ({ ...d, prefs: { ...d.prefs, profile: { ...profileOf(d), ...patch } } }));

  const choosePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl } = await shrinkImage(file, 480, 0.8);
      const id = uid();
      await putAttachment(id, dataUrl);
      if (p.avatarId) dropAttachment(p.avatarId);
      setProfile({ avatarId: id });
      toast("Photo updated");
    } catch (err) { toast("Couldn't use that image"); }
  };

  const finished = useRef(false);
  const typed = useRef(name);
  typed.current = name;
  const save = () => { finished.current = true; setProfile({ name: name.trim() }); onClose(); };

  /* Back button — don't lose a name that was just typed. */
  useEffect(() => () => {
    if (!finished.current && typed.current.trim() !== (p.name || "")) setProfile({ name: typed.current.trim() });
  }, []);

  return (
    <div className="cover" style={{ zIndex: 24 }}>
      <div className="coverbar">
        <button className="navbtn" onClick={save} aria-label="Back to Settings">
          <ChevronLeft size={21} strokeWidth={2.6} style={{ marginRight: -1 }} /><span className="navtext">Settings</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="navbtn" onClick={save}><span className="navtext bold">Done</span></button>
      </div>

      <div className="coverbody">
        <div className="profilebanner" style={{ background: `linear-gradient(158deg, ${skyNow().from}, ${skyNow().to})` }}>
          <button className="avatarwrap" onClick={() => pick.current?.click()} aria-label="Change profile photo">
            <Avatar id={p.avatarId} name={name} size={96} />
            <span className="camerabadge"><Camera size={15} /></span>
          </button>
          <input ref={pick} type="file" accept="image/*" style={{ display: "none" }} onChange={choosePhoto} />
          <h2 className="nm">{name.trim() || "Add your name"}</h2>
          <p className="since">
            {p.since
              ? `Writing here since ${new Date(p.since).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
              : "Your workspace, on this device"}
          </p>
          {p.avatarId && (
            <button className="removephoto" onClick={() => { dropAttachment(p.avatarId); setProfile({ avatarId: null }); toast("Photo removed"); }}>
              Remove photo
            </button>
          )}
        </div>

        <Group title="Your name" footer="NoteFlow greets you by your first name on the Today screen.">
          <div className="item">
            <input className="grow" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()} placeholder="What should we call you?"
              style={{ fontSize: 17 }} aria-label="Your name" />
            {name && <button onClick={() => setName("")} aria-label="Clear name"><X size={16} color="var(--label-3)" /></button>}
          </div>
        </Group>

        <div className="ghead">Your record</div>
        <div className="statgrid">
          <div className="statcard">
            <div className="sqico" style={{ background: "#BE7C17" }}><FileText size={15} /></div>
            <b>{notes}</b><span>{notes === 1 ? "Note" : "Notes"} kept</span>
          </div>
          <div className="statcard">
            <div className="sqico" style={{ background: "#96496F" }}><BookOpen size={15} /></div>
            <b>{entries}</b><span>{entries === 1 ? "Journal entry" : "Journal entries"}</span>
          </div>
          <div className="statcard">
            <div className="sqico" style={{ background: "var(--orange)" }}><Flame size={15} /></div>
            <b>{streak}</b><span>{streak === 1 ? "Day streak" : "Day streak"}</span>
          </div>
          <div className="statcard">
            <div className="sqico" style={{ background: "var(--green)" }}><CheckSquare size={15} /></div>
            <b>{done}</b><span>Tasks completed</span>
          </div>
        </div>

        <div className="ghead">This week</div>
        <Group footer="Everything here is counted on your device. Nothing leaves it.">
          <div className="item">
            <div className="grow"><div className="ttl">Words written</div><div className="sub">Across journal entries</div></div>
            <span className="val">{weekWords.toLocaleString()}</span>
          </div>
          <div className="item">
            <div className="grow"><div className="ttl">Notes added</div></div>
            <span className="val">{weekNotes}</span>
          </div>
          <div className="item">
            <div className="grow"><div className="ttl">Tasks finished</div></div>
            <span className="val">{weekTasks}</span>
          </div>
        </Group>
      </div>
    </div>
  );
}

function SettingsPage({ data, update, voice, onClose, confirm, toast, profileOpen, setProfileOpen }) {
  const done = data.tasks.filter((t) => t.done).length;
  const p = profileOf(data);
  return (
    <div className="cover">
      <div className="coverbar">
        <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Settings</div>
        <button className="navbtn" onClick={onClose} style={{ position: "absolute", right: 8 }}><span className="navtext bold">Done</span></button>
      </div>
      <div className="coverbody">
        <div className="list" style={{ marginBottom: 4 }}>
          <button className="item" style={{ padding: "14px" }} onClick={() => setProfileOpen(true)}>
            <Avatar id={p.avatarId} name={p.name} size={54} />
            <div className="grow" style={{ marginLeft: 3 }}>
              <div className="ttl" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.02em" }}>{p.name || "Add your name"}</div>
              <div className="sub">{p.name ? "Name and profile photo" : "Personalise how NoteFlow greets you"}</div>
            </div>
            <ChevronRight size={17} className="chev" />
          </button>
        </div>

        <div className="hero" style={{ background: `linear-gradient(158deg, ${skyNow().from}, ${skyNow().to})`, padding: "26px 20px 24px", margin: "16px 18px 0", borderRadius: 22 }}>
          <div className="row" style={{ marginTop: 0 }}>
            <div className="ring" style={{ width: 62, height: 62 }}>
              <svg width="62" height="62">
                <circle cx="31" cy="31" r="25" fill="none" stroke="rgba(255,255,255,.26)" strokeWidth="6" />
                <circle cx="31" cy="31" r="25" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 25} strokeDashoffset={2 * Math.PI * 25 * (1 - Math.min(streakOf(data.journal) / 7, 1))} />
              </svg>
              <div className="mid">{streakOf(data.journal)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, letterSpacing: "-.02em" }}>Day streak</h3>
              <p className="cap" style={{ marginTop: 5 }}>{data.notes.filter((n) => !n.archived).length} notes · {Object.keys(data.journal).length} entries · {done} tasks done</p>
            </div>
          </div>
        </div>

        <Group title="Appearance">
          <button className="item inset" onClick={() => { tap(); update((d) => ({ ...d, prefs: { ...d.prefs, dark: !d.prefs.dark } })); }}>
            <div className="sqico" style={{ background: "#5E5CE6" }}>{data.prefs.dark ? <Moon size={15} /> : <Sun size={15} />}</div>
            <div className="grow"><div className="ttl">Dark Mode</div></div>
            <span className={"switch" + (data.prefs.dark ? " on" : "")}><i /></span>
          </button>
        </Group>

        <Group title="Dictation" footer={voice.supported
          ? "Tap the microphone anywhere in NoteFlow to dictate. Speech is processed by your browser."
          : "Dictation needs Safari, Chrome or Edge. Everything else in NoteFlow works normally."}>
          <div className="item inset">
            <div className="sqico" style={{ background: voice.supported ? "var(--green)" : "var(--label-3)" }}><Mic size={15} /></div>
            <div className="grow"><div className="ttl">Voice Typing</div></div>
            <span className="val">{voice.supported ? "Available" : "Unavailable"}</span>
          </div>
        </Group>

        <Group title="Calendar" footer="Exports every scheduled task as a standard .ics file. Open it on your phone to merge them into Google Calendar, Apple Calendar or Outlook. Completed tasks carry a checkmark.">
          <button className="item inset" onClick={() => {
            const n = downloadICS(data.tasks);
            toast(n ? `${n} ${n === 1 ? "task" : "tasks"} exported` : "No scheduled tasks to export");
          }}>
            <div className="sqico" style={{ background: "var(--teal)" }}><CalendarDays size={15} /></div>
            <div className="grow"><div className="ttl">Add Tasks to Calendar</div><div className="sub">Download .ics</div></div>
            <ChevronRight size={16} className="chev" />
          </button>
        </Group>

        <Group title="Data" footer="NoteFlow stores everything on this device. Nothing is uploaded.">
          <button className="item inset" onClick={() => confirm({
            title: "Restore Sample Content?", message: "Your current notes, tasks and entries will be replaced.", danger: "Restore",
            onConfirm: () => {
              data.notes.forEach((n) => dropAll(n.attachments));
              Object.values(data.journal).forEach((e) => dropAll(e.attachments));
              update((d) => ({ ...sample(), prefs: d.prefs }));
              onClose(); toast("Sample content restored");
            },
          })}>
            <div className="sqico" style={{ background: "var(--orange)" }}><RotateCcw size={15} /></div>
            <div className="grow"><div className="ttl">Restore Sample Content</div></div>
            <ChevronRight size={16} className="chev" />
          </button>
          <button className="item inset" onClick={() => confirm({
            title: "Erase All Content?", message: "Every note, task and journal entry will be permanently deleted.", danger: "Erase",
            onConfirm: () => {
              data.notes.forEach((n) => dropAll(n.attachments));
              Object.values(data.journal).forEach((e) => dropAll(e.attachments));
              update((d) => ({ ...blank(), prefs: d.prefs }));
              onClose(); toast("All content erased");
            },
          })}>
            <div className="sqico" style={{ background: "var(--red)" }}><Trash2 size={15} /></div>
            <div className="grow"><div className="ttl" style={{ color: "var(--red)" }}>Erase All Content</div></div>
            <ChevronRight size={16} className="chev" />
          </button>
        </Group>

        <p className="gfoot" style={{ textAlign: "center", paddingTop: 28 }}>NoteFlow 1.0<br />Notes, journal and plans in one place.</p>
      </div>

      {profileOpen && (
        <ProfilePage data={data} update={update} confirm={confirm} toast={toast} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}

function CreateSheet({ onClose, onNote, onTask, onJournal }) {
  const items = [
    { Icon: FileText, bg: "#BE7C17", h: "New Note", p: "An idea, a list, something to keep", fn: onNote },
    { Icon: CheckSquare, bg: "#3F6FA8", h: "New Task", p: "Something to get done", fn: onTask },
    { Icon: BookOpen, bg: "#96496F", h: "Journal Entry", p: "Reflect on today", fn: onJournal },
  ];
  return (
    <>
      <div className="veil" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div className="sheetbar"><h2>Create</h2></div>
        <div style={{ padding: "8px 0 26px" }}>
          <Group>
            {items.map((it) => (
              <button className="item inset" key={it.h} onClick={() => { onClose(); it.fn(); }}>
                <div className="sqico" style={{ background: it.bg }}><it.Icon size={16} /></div>
                <div className="grow"><div className="ttl">{it.h}</div><div className="sub">{it.p}</div></div>
                <ChevronRight size={16} className="chev" />
              </button>
            ))}
          </Group>
          <div className="pad" style={{ marginTop: 18 }}><button className="bigbtn wide quiet" onClick={onClose}>Cancel</button></div>
        </div>
      </div>
    </>
  );
}

function Onboarding({ onStart }) {
  const sky = skyNow();
  const feats = [
    { Icon: FileText, bg: "#BE7C17", h: "Capture anything", p: "Notes, checklists and tags, kept in one searchable place." },
    { Icon: BookOpen, bg: "#96496F", h: "Reflect daily", p: "Guided morning and evening pages with mood and energy." },
    { Icon: CheckSquare, bg: "#3F6FA8", h: "Plan your day", p: "Tasks by time of day, so a plan actually fits in the hours." },
    { Icon: Mic, bg: "var(--red)", h: "Speak instead of type", p: "Dictate into any field with a tap." },
  ];
  return (
    <div className="onb" style={{ background: `linear-gradient(168deg, ${sky.from}, ${sky.to})` }}>
      <div className="mark"><Mark size={40} stroke={2.1} /></div>
      <h1>Welcome to NoteFlow</h1>
      <p className="sub">Your notes, journal and daily plan, finally in the same place.</p>
      <div style={{ marginTop: 8 }}>
        {feats.map((f) => (
          <div className="feat" key={f.h}>
            <div className="sqico" style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", width: 36, height: 36, borderRadius: 11, boxShadow: "none" }}><f.Icon size={17} /></div>
            <div><h4>{f.h}</h4><p>{f.p}</p></div>
          </div>
        ))}
      </div>
      <div className="foot">
        <button className="bigbtn wide" onClick={() => onStart(true)}>Explore with Sample Content</button>
        <button className="bigbtn wide quiet" style={{ marginTop: 10 }} onClick={() => onStart(false)}>Start Empty</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  APP                                                               */
/* ══════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "today", label: "Today", Icon: LayoutGrid },
  { id: "notes", label: "Notes", Icon: FileText },
  { id: "journal", label: "Journal", Icon: BookOpen },
  { id: "planner", label: "Planner", Icon: CheckSquare },
];

export default function NoteFlow() {
  const { data, update, saveFailed } = useStore();
  const voice = useVoice();
  const [tab, setTab] = useState("today");
  const [note, setNote] = useState(null);
  const [journal, setJournal] = useState(null);
  const [task, setTask] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef(null);
  const [undo, setUndo] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); setScrolled(false); voice.stop(); }, [tab]);

  /* ── Hardware / browser back ──────────────────────────────────────
     Every open layer adds one entry to session history, so Android's back
     button peels them off one at a time instead of leaving the app. On the
     Today screen with nothing open, back exits — which is what people expect. */
  const layers =
    (task ? 1 : 0) + (note ? 1 : 0) + (journal ? 1 : 0) +
    (profileOpen ? 1 : 0) + (sheet ? 1 : 0) + (tab !== "today" ? 1 : 0);
  const depth = useRef(0);
  const skipPop = useRef(0);

  const closeTop = useCallback(() => {
    if (task) { setTask(null); return; }
    if (note) { setNote(null); return; }
    if (journal) { setJournal(null); return; }
    if (profileOpen) { setProfileOpen(false); return; }
    if (sheet) { setSheet(null); return; }
    if (tab !== "today") setTab("today");
  }, [task, note, journal, profileOpen, sheet, tab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (layers > depth.current) {
      for (let i = depth.current; i < layers; i++) window.history.pushState({ noteflow: i + 1 }, "");
    } else if (layers < depth.current) {
      /* closed from the UI, so drop the matching history entries quietly */
      skipPop.current += 1;
      window.history.go(layers - depth.current);
    }
    depth.current = layers;
  }, [layers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      if (skipPop.current > 0) { skipPop.current -= 1; return; }
      if (depth.current > 0) { depth.current -= 1; closeTop(); }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeTop]);

  /* Long-press shortcuts on the home screen open straight into a new item. */
  const launched = useRef(false);
  useEffect(() => {
    if (!data || launched.current || typeof window === "undefined") return;
    launched.current = true;
    const wanted = new URLSearchParams(window.location.search).get("new");
    if (!wanted) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (wanted === "note") { setTab("notes"); setNote({ id: uid(), emoji: "📝", title: "", body: "", tint: "plain", pinned: false, archived: false, checklist: [], tags: [], attachments: [], createdAt: Date.now(), updatedAt: Date.now() }); }
    else if (wanted === "journal") { setTab("journal"); setJournal({ key: TODAY(), entry: { body: "", mood: null, energy: 0, weather: null, attachments: [], exists: false } }); }
    else if (wanted === "task") { setTab("planner"); setTask({ id: uid(), title: "", done: false, due: TODAY(), priority: "medium", slot: "morning", notes: "", createdAt: Date.now() }); }
  }, [data]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const toast = useCallback((message, undoFn) => {
    clearTimeout(timerRef.current);
    setUndo(() => undoFn || null);
    setToastMsg(message);
    timerRef.current = setTimeout(() => { setToastMsg(null); setUndo(null); }, undoFn ? 5200 : 2400);
  }, []);
  const confirm = useCallback((cfg) => setAlert(cfg), []);

  /* Storage full or blocked — say so rather than losing work quietly. */
  useEffect(() => {
    if (saveFailed) toast("Couldn't save — device storage may be full");
  }, [saveFailed, toast]);

  if (!data) {
    return <div className="nf"><style>{CSS}</style><div className="device"><div className="canvas" /></div></div>;
  }

  const dark = data.prefs.dark;

  if (!data.prefs.onboarded) {
    return (
      <div className={"nf" + (dark ? " dark" : "")}>
        <style>{CSS}</style>
        <div className="device">
          <div className="canvas" style={accentFor("today", dark)}>
            <Onboarding onStart={(withSample) => update(() => (withSample ? sample() : blank()))} />
          </div>
        </div>
      </div>
    );
  }

  const stacked = !!(note || journal || task || sheet);

  /* The compose button does whatever the screen you're on is for.
     Only Today is ambiguous, so only Today asks. */
  const FAB = {
    today: { label: "Create", run: () => setSheet("create") },
    notes: { label: "New note", run: () => newNote() },
    journal: { label: "New journal entry", run: () => openJournal(TODAY()) },
    planner: { label: "New task", run: () => newTask() },
  };
  const fabLabel = FAB[tab].label;
  const fabAction = () => { tap(); FAB[tab].run(); };

  /* notes */
  const saveNote = (n) => update((d) => ({ ...d, notes: d.notes.some((x) => x.id === n.id) ? d.notes.map((x) => x.id === n.id ? n : x) : [n, ...d.notes] }));
  const deleteNote = (id, silent) => {
    const gone = data.notes.find((n) => n.id === id);
    dropAll(gone?.attachments);
    update((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) }));
    if (!silent && gone) toast("Note deleted", () => update((d) => ({ ...d, notes: [gone, ...d.notes] })));
  };
  const newNote = () => setNote({ id: uid(), emoji: "📝", title: "", body: "", tint: "plain", pinned: false, archived: false, checklist: [], tags: [], attachments: [], createdAt: Date.now(), updatedAt: Date.now() });

  /* journal */
  const openJournal = (k) => {
    const e = data.journal[k];
    setJournal({ key: k, entry: e ? { ...e, body: entryText(e), exists: true } : { body: "", mood: null, energy: 0, weather: null, attachments: [], exists: false } });
  };
  const saveJournal = (k, e) => { const c = { ...e }; delete c.exists; update((d) => ({ ...d, journal: { ...d.journal, [k]: c } })); };
  const deleteJournal = (k) => {
    dropAll(data.journal[k]?.attachments);
    update((d) => { const j = { ...d.journal }; delete j[k]; return { ...d, journal: j }; });
  };

  /* tasks */
  const saveTask = (t) => update((d) => ({ ...d, tasks: d.tasks.some((x) => x.id === t.id) ? d.tasks.map((x) => x.id === t.id ? t : x) : [t, ...d.tasks] }));
  const deleteTask = (id) => {
    const gone = data.tasks.find((t) => t.id === id);
    update((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) }));
    if (gone) toast("Task deleted", () => update((d) => ({ ...d, tasks: [gone, ...d.tasks] })));
  };
  const newTask = () => setTask({ id: uid(), title: "", done: false, due: TODAY(), priority: "medium", slot: "morning", notes: "", createdAt: Date.now() });

  return (
    <div className={"nf" + (dark ? " dark" : "")}>
      <style>{CSS}</style>
      <div className="device">
        <div className={"canvas" + (stacked ? " pushed" : "")} style={accentFor(tab, dark)}>
          <header className={"navbar" + (scrolled ? " solid" : "") + (tab === "today" && !scrolled ? " overhero" : "")}>
            <div style={{ width: 38 }} />
            <div className="navtitle">{TABS.find((t) => t.id === tab).label}</div>
            <button className="navbtn" onClick={() => setSheet("search")} aria-label="Search"><Search size={19} /></button>
            <button className="navbtn" onClick={() => setSheet("settings")} aria-label="Settings">
              {profileOf(data).avatarId || profileOf(data).name
                ? <Avatar id={profileOf(data).avatarId} name={profileOf(data).name} size={28} />
                : <Settings size={19} />}
            </button>
          </header>

          <div className={"scroll" + (tab === "today" ? " herotop" : "")} ref={scroller} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 26)}>
            {tab === "today" && <Today data={data} update={update} go={setTab} openNote={setNote} openJournal={openJournal} voice={voice} toast={toast} />}
            {tab === "notes" && <Notes data={data} openNote={setNote} voice={voice} />}
            {tab === "journal" && <Journal data={data} openJournal={openJournal} />}
            {tab === "planner" && <Planner data={data} update={update} openTask={setTask} openJournal={openJournal} voice={voice} toast={toast} />}
          </div>

          <button className="fab" onClick={fabAction} aria-label={fabLabel}
            style={{ background: `linear-gradient(150deg, ${skyNow().from}, ${skyNow().to})`, boxShadow: `0 10px 26px -8px ${skyNow().to}` }}>
            <Plus size={25} strokeWidth={2.4} />
          </button>

          <nav className="tabbar">
            {TABS.map((t) => (
              <button key={t.id} className={"tabbtn" + (tab === t.id ? " on" : "")} onClick={() => { tap(); setTab(t.id); }} aria-label={t.label}>
                <t.Icon size={22} strokeWidth={tab === t.id ? 2.3 : 1.8} />{t.label}
              </button>
            ))}
          </nav>
        </div>

        {sheet === "create" && <CreateSheet onClose={() => setSheet(null)} onNote={newNote} onTask={newTask} onJournal={() => openJournal(TODAY())} />}
        {sheet === "search" && <SearchPage data={data} voice={voice} onClose={() => setSheet(null)} openNote={setNote} openJournal={openJournal} openTask={setTask} go={setTab} />}
        {sheet === "settings" && <SettingsPage data={data} update={update} voice={voice} confirm={confirm} toast={toast}
          profileOpen={profileOpen} setProfileOpen={setProfileOpen} onClose={() => { setProfileOpen(false); setSheet(null); }} />}

        {note && <NoteEditor key={note.id} note={data.notes.find((n) => n.id === note.id) || note} dark={dark} voice={voice}
          onSave={saveNote} onDelete={deleteNote} onClose={() => setNote(null)} toast={toast} confirm={confirm} />}
        {journal && <JournalEditor key={journal.key} dateKey={journal.key} entry={journal.entry} voice={voice}
          onSave={saveJournal} onDelete={deleteJournal} onClose={() => setJournal(null)} confirm={confirm} toast={toast} />}
        {task && <TaskEditor key={task.id} task={task} voice={voice} onSave={saveTask} onDelete={deleteTask}
          onClose={() => setTask(null)} confirm={confirm} toast={toast} />}

        {toastMsg && (
          <div className="toast">
            <span>{toastMsg}</span>
            {undo && <button onClick={() => { undo(); setUndo(null); setToastMsg(null); clearTimeout(timerRef.current); }}>Undo</button>}
          </div>
        )}

        <div className="grain" />

        {alert && (
          <div className="alertwrap" onClick={() => setAlert(null)}>
            <div className="alert" onClick={(e) => e.stopPropagation()}>
              <div className="body"><h3>{alert.title}</h3><p>{alert.message}</p></div>
              <div className="acts">
                <button onClick={() => setAlert(null)}>Cancel</button>
                <button className="danger" onClick={() => { const f = alert.onConfirm; setAlert(null); f?.(); }}>{alert.danger}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
