import { useState, useEffect } from "react";
import {
  Waves, Eye, Sparkles, Copy, Save, History, Trash2,
  ChevronDown, ChevronUp, Check, Loader2, X, RefreshCw, Plus, Pencil
} from "lucide-react";

/* ---------------------------------------------------------
   DATA: themes (the lens), triggers (the survival hook),
   durations (pacing + platform)
--------------------------------------------------------- */

const THEMES = [
  { id: "unconscious", label: "The Unconscious Mind", tag: "THE ENEMY", featured: true,
    blurb: "The core villain — old wiring running the show beneath awareness.",
    promptAngle: "The villain of this script is the unconscious mind itself — the automatic, pre-verbal programming installed before age seven that runs the viewer's reactions, relationships, and self-sabotage without their consent. Frame it as a force working against the viewer's stated goals, separate from their conscious identity, so they can fight it instead of feeling shame about it." },
  { id: "selfsabotage", label: "Self-Sabotage", tag: "HIDDEN PATTERNS",
    blurb: "The repeating pattern that wrecks progress right before the finish line.",
    promptAngle: "Center on a specific self-sabotage pattern (procrastination, sabotaging relationships right when they get good, quitting at the edge of a breakthrough) and trace it back to an unconscious protective mechanism that once kept the viewer safe." },
  { id: "shadow", label: "Shadow Work", tag: "JUNGIAN",
    blurb: "The disowned parts of self running in the dark.",
    promptAngle: "Use Jungian shadow framing — the disowned, repressed, or denied parts of the self that get projected onto others or numbed out, and the cost of refusing to look at them." },
  { id: "nervoussystem", label: "Nervous System", tag: "REGULATION",
    blurb: "Fight, flight, freeze, fawn — running the body before the mind decides.",
    promptAngle: "Ground the script in nervous system science (fight / flight / freeze / fawn, polyvagal-informed language) — show how dysregulation, not character flaws, drives the viewer's reactions." },
  { id: "conditioning", label: "Childhood Conditioning", tag: "OLD PROGRAMMING",
    blurb: "Beliefs installed before age seven, still running the adult.",
    promptAngle: "Trace a present-day adult pattern back to a childhood-era belief or survival strategy that was adaptive then and is sabotaging now." },
  { id: "burnout", label: "Burnout & Identity", tag: "LOST SELF",
    blurb: "When achievement becomes a mask for an identity that disappeared.",
    promptAngle: "Explore burnout as an identity crisis — the gap between who the viewer performs as and who they actually are underneath the performance." },
  { id: "dopamine", label: "Dopamine & Distraction", tag: "MODERN HIJACK",
    blurb: "A brain wired for scarcity, hijacked by infinite stimulation.",
    promptAngle: "Explain how modern dopamine triggers (scrolling, notifications, instant gratification) hijack ancient survival wiring, and what it costs the viewer's focus, relationships, or goals." },
  { id: "anxiety", label: "Anxiety & Hypervigilance", tag: "FALSE ALARMS",
    blurb: "A threat-detection system stuck scanning for danger that already passed.",
    promptAngle: "Frame anxiety as an over-tuned threat-detection system, not a personal weakness — and show the unconscious origin of the false alarm." },
  { id: "rewiring", label: "Rewiring & Alignment", tag: "BECOMING ALIGNED",
    blurb: "Replacing old automatic programs with chosen ones.",
    promptAngle: "Focus on the process of consciously rewiring an automatic pattern — make the plan section concrete and actionable, since this theme is about the path forward more than the wound itself." },
];

const TRIGGERS = [
  { id: "leftbehind", label: "Left Behind", blurb: "Everyone else is figuring it out except you.",
    promptAngle: "Survival stake: falling behind the group, or missing the window while others move ahead." },
  { id: "notenough", label: "Not Enough", blurb: "The quiet belief that you are the problem.",
    promptAngle: "Survival stake: core shame — the fear of being fundamentally inadequate or unlovable as-is." },
  { id: "rejection", label: "Rejection", blurb: "Being seen clearly, then left.",
    promptAngle: "Survival stake: abandonment — being cast out once the mask drops." },
  { id: "control", label: "Loss of Control", blurb: "Watching your own reactions hijack your life.",
    promptAngle: "Survival stake: helplessness — watching yourself repeat a pattern you swore you'd stop." },
  { id: "scarcity", label: "Scarcity", blurb: "Not enough time, money, or chances left.",
    promptAngle: "Survival stake: resource scarcity — running out of time, money, or opportunity to change." },
  { id: "status", label: "Status Threat", blurb: "Looking weak in front of people who matter.",
    promptAngle: "Survival stake: social status — being seen as failing, weak, or behind by peers who matter." },
  { id: "safety", label: "Safety Threat", blurb: "The body bracing for danger that already passed.",
    promptAngle: "Survival stake: physical or emotional safety — the body's alarm system stuck in the on position." },
  { id: "isolation", label: "Isolation", blurb: "Surrounded by people, still completely alone.",
    promptAngle: "Survival stake: disconnection — being unseen or unknown even inside close relationships." },
  { id: "identity", label: "Identity Crisis", blurb: "Succeeding at a life that was never actually yours.",
    promptAngle: "Survival stake: existential — discovering the life you built doesn't belong to the real you." },
  { id: "powerless", label: "Powerlessness", blurb: "Stuck on repeat, convinced nothing changes.",
    promptAngle: "Survival stake: learned helplessness — the belief that effort doesn't matter because nothing has worked before." },
];

const DURATIONS = [
  { id: "15s", label: "15 sec", platform: "Reels / TikTok / Shorts", words: 35 },
  { id: "30s", label: "30 sec", platform: "Reels / TikTok / Shorts", words: 70 },
  { id: "60s", label: "60 sec", platform: "Reels / TikTok / Shorts", words: 140 },
  { id: "90s", label: "90 sec", platform: "Extended short-form", words: 210 },
  { id: "3m", label: "3 min", platform: "YouTube", words: 420 },
  { id: "5m", label: "5 min", platform: "YouTube", words: 700 },
  { id: "10m", label: "10 min", platform: "YouTube long-form", words: 1400 },
];

const LOADING_MESSAGES = [
  "Listening for the pattern...",
  "Tracing the wiring...",
  "Naming the villain...",
  "Pulling it into words...",
];

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildSystemPrompt(theme, trigger, duration, customBrief) {
  const briefSection = customBrief && customBrief.trim()
    ? `\n\nADDITIONAL DIRECTION FROM THE FOUNDER — incorporate this specific idea, story, or angle into the script: "${customBrief.trim()}"`
    : "";
  return `You are the lead scriptwriter for Aligned Order, an emotional intelligence and nervous-system-based coaching brand. You write short, spoken, talking-head video scripts for Instagram Reels, TikTok, and YouTube, in the voice of the brand's founder.

BRAND VOICE: grounded in psychology, neuroscience, and Jungian shadow work. Dark, cinematic, emotionally honest — never clinical, never preachy, never generic self-help. Speaks to the viewer like someone who has been in the dark with them and found a way out.

VILLAIN — Donald Miller's StoryBrand, applied to a single-person video:
- The VIEWER is the hero. Never the brand, never the founder.
- The VILLAIN of every script is some expression of the unconscious mind — old wiring, automatic programming, a protective mechanism installed long before the viewer could consent to it. Externalize it. The viewer is not broken; something is running underneath them without permission.
- Open with a SURVIVAL-LEVEL stake within the first 1-2 sentences — the kind of line that trips the brain's threat-and-relevance detector, so it feels personally urgent rather than abstractly interesting.

STRUCTURE — the body of the script follows Donald Miller's PEACE framework, beat by beat:
- P — Problem: name the specific problem precisely, rooted in the villain established above.
- E — Empathy: show the viewer you understand exactly how this feels, in plain, felt language — no clinical distance, no platitudes.
- A — Answer: deliver ONE clear insight or reframe that addresses the problem — something a viewer could act on today, not a vague platitude.
- C — Change: make concrete what's different once the viewer applies the answer — a specific before/after, a shift in behavior or self-perception.
- E — End Result: paint the end state — who they get to become, what becomes possible, the version of safety, belonging, or status they get to keep.
Each beat should read as one continuous piece of spoken language flowing into the next — these are structural instructions for you, not headers to say out loud. For very short durations, compress each beat to a single short line rather than skipping it.

CALL TO ACTION: end with a direct call to action sized for the format (follow for the next pattern, save this, send it to someone stuck in this, or a soft mention of Aligned Order's coaching work) — never hard-sell.

VOICE: Sentences are short. Spoken rhythm, not written rhythm. No jargon unless immediately translated into plain language. Concrete imagery over abstraction.

THIS SCRIPT:
Theme (the lens): ${theme.label} — ${theme.promptAngle}
Trigger (the survival hook): ${trigger.label} — ${trigger.promptAngle}
Target length: ${duration.label} spoken video (~${duration.words} words total across hook + the five PEACE beats + CTA, at natural spoken pace). Stay close to this word count — it determines whether the script fits the runtime.${briefSection}

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"title":"short internal title for this script","hook":"the first 1-3 spoken sentences, the pattern interrupt","problem":"the Problem beat","empathy":"the Empathy beat","answer":"the Answer beat","change":"the Change beat","endResult":"the End Result beat","cta":"the final spoken call to action, 1-2 sentences","onScreenText":["short text overlay cue 1","short text overlay cue 2","short text overlay cue 3"],"caption":"a short social caption with line breaks as \\n, ending in 3-5 relevant hashtags"}

Write the full script now for this theme, trigger, and duration.`;
}

function fullScriptText(s) {
  const cues = (s.onScreenText || []).map((t) => "- " + t).join("\n");
  return `${s.title}\n\nHOOK:\n${s.hook}\n\nPROBLEM:\n${s.problem}\n\nEMPATHY:\n${s.empathy}\n\nANSWER:\n${s.answer}\n\nCHANGE:\n${s.change}\n\nEND RESULT:\n${s.endResult}\n\nCTA:\n${s.cta}\n\nON-SCREEN TEXT:\n${cues}\n\nCAPTION:\n${s.caption}`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ---------------------------------------------------------
   COMPONENT
--------------------------------------------------------- */

export default function App() {
  const [tab, setTab] = useState("lab");
  const [themeId, setThemeId] = useState(null);
  const [triggerId, setTriggerId] = useState(null);
  const [durationId, setDurationId] = useState(null);

  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingIdx, setLoadingIdx] = useState(0);

  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [saveFeedback, setSaveFeedback] = useState(false);

  const [customThemeText, setCustomThemeText] = useState("");
  const [customTriggerText, setCustomTriggerText] = useState("");
  const [customBrief, setCustomBrief] = useState("");
  const [briefDraft, setBriefDraft] = useState("");
  const [showBriefModal, setShowBriefModal] = useState(false);

  const selectedTheme = customThemeText.trim()
    ? {
        id: "custom",
        label: customThemeText.trim(),
        tag: "YOUR IDEA",
        featured: false,
        custom: true,
        blurb: "Your own theme.",
        promptAngle: `The founder supplied this specific theme: "${customThemeText.trim()}". Build the script's lens and villain framing around this idea directly, still treating the unconscious mind as the underlying force where it fits naturally.`,
      }
    : THEMES.find((t) => t.id === themeId) || null;
  const selectedTrigger = customTriggerText.trim()
    ? {
        id: "custom",
        label: customTriggerText.trim(),
        custom: true,
        blurb: "Your own trigger.",
        promptAngle: `The founder supplied this specific emotional trigger: "${customTriggerText.trim()}". Use it as the survival-level stake the hook and CTA are built around.`,
      }
    : TRIGGERS.find((t) => t.id === triggerId) || null;
  const selectedDuration = DURATIONS.find((d) => d.id === durationId) || null;
  const selectedCount = [selectedTheme, selectedTrigger, selectedDuration].filter(Boolean).length;

  /* loading message rotation */
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => {
      setLoadingIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1300);
    return () => clearInterval(iv);
  }, [loading]);

  /* load history from the Google Sheets backend (via Netlify function proxy) */
  useEffect(() => {
    (async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch("/.netlify/functions/sheets-proxy");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const items = (data.items || []).map((it) => ({ ...it, savedAt: Number(it.savedAt) || 0 }));
        items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setHistory(items);
        setHistoryError("");
      } catch (e) {
        setHistory([]);
        setHistoryError("Could not load history. Check the Google Sheets connection (see README).");
      } finally {
        setHistoryLoaded(true);
        setHistoryLoading(false);
      }
    })();
  }, []);

  function pickToday() {
    const seed = new Date().toISOString().slice(0, 10);
    const h = hashStr(seed);
    setThemeId(THEMES[h % THEMES.length].id);
    setTriggerId(TRIGGERS[Math.floor(h / 7) % TRIGGERS.length].id);
    setDurationId(DURATIONS[Math.floor(h / 13) % DURATIONS.length].id);
    setCustomThemeText("");
    setCustomTriggerText("");
    setCustomBrief("");
    setScript(null);
    setErrorMsg("");
  }

  async function generateScript() {
    if (!selectedTheme || !selectedTrigger || !selectedDuration) return;
    setLoading(true);
    setErrorMsg("");
    setSaveFeedback(false);
    try {
      const sys = buildSystemPrompt(selectedTheme, selectedTrigger, selectedDuration, customBrief);
      const res = await fetch("/.netlify/functions/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: sys, message: "Write the script now." }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const textBlock = (data.content || []).find((b) => b.type === "text");
      if (!textBlock) throw new Error("empty response");
      let raw = textBlock.text.trim();
      raw = raw.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(raw);
      setScript(parsed);
    } catch (e) {
      setErrorMsg("The script did not come through cleanly. Try generating again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
    } catch (e) {
      setCopyFeedback("error");
    } finally {
      setTimeout(() => setCopyFeedback(""), 1500);
    }
  }

  async function saveToHistory() {
    if (!script || !selectedTheme || !selectedTrigger || !selectedDuration) return;
    const record = {
      id: String(Date.now()),
      savedAt: Date.now(),
      themeId: selectedTheme.id,
      themeLabel: selectedTheme.label,
      triggerId: selectedTrigger.id,
      triggerLabel: selectedTrigger.label,
      durationId,
      durationLabel: selectedDuration.label,
      title: script.title,
      hook: script.hook,
      problem: script.problem,
      empathy: script.empathy,
      answer: script.answer,
      change: script.change,
      endResult: script.endResult,
      cta: script.cta,
      onScreenText: script.onScreenText || [],
      caption: script.caption,
      customBrief: customBrief || "",
    };
    try {
      const res = await fetch("/.netlify/functions/sheets-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", record }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHistory((h) => [record, ...h]);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1500);
    } catch (e) {
      setErrorMsg("Could not save this script to your sheet. Check the Google Sheets connection.");
    }
  }

  async function deleteHistoryItem(id) {
    try {
      await fetch("/.netlify/functions/sheets-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      setHistory((h) => h.filter((item) => item.id !== id));
      setDeleteConfirmKey(null);
      if (expandedKey === id) setExpandedKey(null);
    } catch (e) {
      /* no-op */
    }
  }

  const fillPct = (selectedCount / 3) * 100;

  return (
    <div className="undertow-root w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="uw-mono uw-muted text-[11px] tracking-widest uppercase mb-2">
              Aligned Order · Internal Tool
            </div>
            <div className="flex items-center gap-3">
              <Waves size={26} className="uw-ember-text" />
              <h1 className="uw-display text-3xl sm:text-4xl font-semibold uw-ink">Undertow</h1>
            </div>
            <p className="uw-muted text-sm mt-2 max-w-md">
              Daily script lab. Built on the StoryBrand framework — the unconscious mind plays the villain in every script.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("lab")}
              className={`uw-mono text-xs uppercase tracking-wide px-3 py-2 ${tab === "lab" ? "uw-tab-active" : "uw-tab"}`}
            >
              Lab
            </button>
            <button
              onClick={() => setTab("history")}
              className={`uw-mono text-xs uppercase tracking-wide px-3 py-2 flex items-center gap-1 ${tab === "history" ? "uw-tab-active" : "uw-tab"}`}
            >
              <History size={14} /> History {history.length > 0 ? `(${history.length})` : ""}
            </button>
          </div>
        </div>

        {tab === "lab" && (
          <div>
            {/* DAILY PICK */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest">
                Surface <span className="uw-rust-text">→</span> Depth
              </div>
              <button
                onClick={pickToday}
                className="uw-btn-ghost rounded-full px-4 py-2 text-xs uw-mono uppercase tracking-wide flex items-center gap-2"
              >
                <Sparkles size={14} /> Pull today's combo
              </button>
            </div>

            {/* DEPTH METER */}
            <div className="uw-depth-track rounded-full h-2 w-full mb-1 overflow-hidden">
              <div className="uw-depth-fill h-full rounded-full" style={{ width: `${fillPct}%` }} />
            </div>
            <div className="flex justify-between uw-mono uw-muted text-[10px] uppercase tracking-widest mb-8">
              <span>Theme</span>
              <span>Trigger</span>
              <span>Duration</span>
            </div>

            {/* STEP 1: THEME */}
            <div className="mb-7">
              <div className="uw-mono uw-muted text-xs uppercase tracking-widest mb-3">1 · Theme</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {THEMES.map((t) => {
                  const active = t.id === themeId;
                  const cls = active
                    ? (t.featured ? "uw-chip-active-featured" : "uw-chip-active")
                    : (t.featured ? "uw-chip uw-chip-featured" : "uw-chip");
                  return (
                    <button key={t.id} onClick={() => { setThemeId(t.id); setCustomThemeText(""); }} className={`${cls} rounded-xl p-3`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium uw-ink">{t.label}</span>
                        {t.featured && <Eye size={14} className="uw-rust-text shrink-0" />}
                      </div>
                      <div className={`uw-tag inline-block rounded px-1.5 py-0.5 mb-1.5 ${t.featured ? "uw-tag-rust" : "uw-tag-ember"}`}>
                        {t.tag}
                      </div>
                      <p className="text-xs uw-muted leading-snug">{t.blurb}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2">
                <label className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1.5 block">Or describe your own theme</label>
                <input
                  type="text"
                  value={customThemeText}
                  onChange={(e) => { setCustomThemeText(e.target.value); if (themeId) setThemeId(null); }}
                  placeholder="e.g. the inner critic that shows up right before bed"
                  className={`uw-input w-full rounded-xl px-3 py-2.5 text-sm ${customThemeText.trim() ? "uw-input-active" : ""}`}
                />
              </div>
            </div>

            {/* STEP 2: TRIGGER */}
            <div className="mb-7">
              <div className="uw-mono uw-muted text-xs uppercase tracking-widest mb-3">2 · Trigger</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {TRIGGERS.map((tr) => {
                  const active = tr.id === triggerId;
                  return (
                    <button
                      key={tr.id}
                      onClick={() => { setTriggerId(tr.id); setCustomTriggerText(""); }}
                      className={`${active ? "uw-chip-active" : "uw-chip"} rounded-xl p-3`}
                    >
                      <div className="text-sm font-medium uw-ink mb-1">{tr.label}</div>
                      <p className="text-xs uw-muted leading-snug">{tr.blurb}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2">
                <label className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1.5 block">Or describe your own trigger</label>
                <input
                  type="text"
                  value={customTriggerText}
                  onChange={(e) => { setCustomTriggerText(e.target.value); if (triggerId) setTriggerId(null); }}
                  placeholder="e.g. watching someone else get the thing you gave up on"
                  className={`uw-input w-full rounded-xl px-3 py-2.5 text-sm ${customTriggerText.trim() ? "uw-input-active" : ""}`}
                />
              </div>
            </div>

            {/* STEP 3: DURATION */}
            <div className="mb-8">
              <div className="uw-mono uw-muted text-xs uppercase tracking-widest mb-3">3 · Duration</div>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => {
                  const active = d.id === durationId;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDurationId(d.id)}
                      className={`${active ? "uw-chip-active" : "uw-chip"} rounded-xl px-4 py-2.5`}
                    >
                      <div className="text-sm font-medium uw-ink">{d.label}</div>
                      <div className="text-[11px] uw-muted">{d.platform}</div>
                      <div className="uw-mono text-[10px] uw-muted mt-0.5">~{d.words} words</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3">
                {customBrief ? (
                  <div className="uw-input-active rounded-xl px-3 py-2.5 flex items-start justify-between gap-3">
                    <div>
                      <div className="uw-mono uw-ember-text text-[10px] uppercase tracking-widest mb-1">Your idea</div>
                      <p className="text-sm uw-ink leading-snug">{customBrief}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setBriefDraft(customBrief); setShowBriefModal(true); }} className="uw-btn-ghost rounded-lg p-1.5" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setCustomBrief("")} className="uw-btn-ghost rounded-lg p-1.5" title="Remove">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setBriefDraft(""); setShowBriefModal(true); }}
                    className="uw-btn-ghost rounded-xl px-3 py-2.5 text-xs uw-mono flex items-center justify-center gap-2 w-full"
                  >
                    <Plus size={14} /> Add your own idea for this script
                  </button>
                )}
              </div>
            </div>

            {/* CUSTOM BRIEF MODAL */}
            {showBriefModal && (
              <div
                className="fixed inset-0 uw-modal-backdrop flex items-center justify-center p-4 z-50"
                onClick={() => setShowBriefModal(false)}
              >
                <div className="uw-surface uw-border rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="uw-display text-lg uw-ink">Your own idea</h3>
                    <button onClick={() => setShowBriefModal(false)} className="uw-btn-ghost rounded-lg p-1.5">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="uw-muted text-xs mb-3">
                    Describe a specific angle, story, or hook you want this script built around. It gets folded into the theme and trigger picked above.
                  </p>
                  <textarea
                    value={briefDraft}
                    onChange={(e) => setBriefDraft(e.target.value)}
                    rows={5}
                    placeholder="e.g. tie it to the moment right before quitting a job that looked perfect from the outside"
                    className="uw-textarea w-full rounded-xl px-3 py-2.5 text-sm mb-4"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowBriefModal(false)} className="uw-btn-ghost rounded-lg px-4 py-2 text-xs uw-mono">
                      Cancel
                    </button>
                    <button
                      onClick={() => { setCustomBrief(briefDraft.trim()); setShowBriefModal(false); }}
                      className="uw-btn-ember rounded-lg px-4 py-2 text-xs uw-mono font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={generateScript}
              disabled={!selectedTheme || !selectedTrigger || !selectedDuration || loading}
              className="uw-btn-ember rounded-xl w-full py-3.5 font-medium flex items-center justify-center gap-2 mb-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {LOADING_MESSAGES[loadingIdx]}
                </>
              ) : script ? (
                <>
                  <RefreshCw size={16} /> Generate another version
                </>
              ) : (
                "Generate today's script"
              )}
            </button>
            {errorMsg && <p className="text-xs uw-rust-text mb-4">{errorMsg}</p>}

            {/* OUTPUT */}
            {script && (
              <div className="uw-surface uw-border rounded-2xl p-5 sm:p-7 mt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTheme && (
                    <span className={`uw-tag rounded px-2 py-1 ${selectedTheme.featured ? "uw-tag-rust" : "uw-tag-ember"}`}>
                      {selectedTheme.label.toUpperCase()}
                    </span>
                  )}
                  {selectedTrigger && <span className="uw-tag uw-tag-teal rounded px-2 py-1">{selectedTrigger.label.toUpperCase()}</span>}
                  {selectedDuration && <span className="uw-tag uw-tag-ember rounded px-2 py-1">{selectedDuration.label.toUpperCase()}</span>}
                </div>

                <h2 className="uw-display text-2xl sm:text-3xl font-semibold uw-ink mb-5">{script.title}</h2>

                <div className="mb-5">
                  <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest mb-2">Hook</div>
                  <p className="uw-display text-lg sm:text-xl leading-snug uw-ink">{script.hook}</p>
                </div>

                <div className="mb-5 flex flex-col gap-4">
                  <div>
                    <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest mb-1">Problem</div>
                    <p className="text-[15px] leading-relaxed uw-ink">{script.problem}</p>
                  </div>
                  <div>
                    <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest mb-1">Empathy</div>
                    <p className="text-[15px] leading-relaxed uw-ink">{script.empathy}</p>
                  </div>
                  <div>
                    <div className="uw-mono uw-teal-text text-[11px] uppercase tracking-widest mb-1">Answer</div>
                    <p className="text-[15px] leading-relaxed uw-ink">{script.answer}</p>
                  </div>
                  <div>
                    <div className="uw-mono uw-teal-text text-[11px] uppercase tracking-widest mb-1">Change</div>
                    <p className="text-[15px] leading-relaxed uw-ink">{script.change}</p>
                  </div>
                  <div>
                    <div className="uw-mono uw-ember-text text-[11px] uppercase tracking-widest mb-1">End Result</div>
                    <p className="text-[15px] leading-relaxed uw-ink">{script.endResult}</p>
                  </div>
                </div>

                <div className="uw-cta-box rounded-lg p-4 mb-5">
                  <div className="uw-mono uw-ember-text text-[11px] uppercase tracking-widest mb-1.5">Call to action</div>
                  <p className="text-[15px] leading-relaxed uw-ink">{script.cta}</p>
                </div>

                {script.onScreenText && script.onScreenText.length > 0 && (
                  <div className="mb-5">
                    <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest mb-2">On-screen text</div>
                    <div className="flex flex-wrap gap-2">
                      {script.onScreenText.map((t, i) => (
                        <span key={i} className="uw-mono text-xs uw-surface2 uw-border rounded px-2 py-1 uw-ink">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className="uw-mono uw-muted text-[11px] uppercase tracking-widest mb-2">Caption</div>
                  <p className="uw-mono text-xs uw-muted leading-relaxed whitespace-pre-line uw-surface2 uw-border rounded-lg p-3">{script.caption}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => copyText(fullScriptText(script), "full")} className="uw-btn-ghost rounded-lg px-3 py-2 text-xs uw-mono flex items-center gap-1.5">
                    {copyFeedback === "full" ? <Check size={14} /> : <Copy size={14} />}
                    {copyFeedback === "full" ? "Copied" : "Copy full script"}
                  </button>
                  <button onClick={() => copyText(script.caption, "caption")} className="uw-btn-ghost rounded-lg px-3 py-2 text-xs uw-mono flex items-center gap-1.5">
                    {copyFeedback === "caption" ? <Check size={14} /> : <Copy size={14} />}
                    {copyFeedback === "caption" ? "Copied" : "Copy caption"}
                  </button>
                  <button onClick={saveToHistory} className="uw-btn-ghost rounded-lg px-3 py-2 text-xs uw-mono flex items-center gap-1.5">
                    {saveFeedback ? <Check size={14} /> : <Save size={14} />}
                    {saveFeedback ? "Saved" : "Save to history"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            {historyLoading && <p className="uw-muted text-sm">Loading history...</p>}
            {!historyLoading && historyError && (
              <div className="uw-surface uw-border rounded-2xl p-8 text-center">
                <p className="uw-rust-text text-sm">{historyError}</p>
              </div>
            )}
            {!historyLoading && !historyError && historyLoaded && history.length === 0 && (
              <div className="uw-surface uw-border rounded-2xl p-8 text-center">
                <p className="uw-muted text-sm">Nothing saved yet. Generate a script in the Lab and save it to build your library.</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {history.map((item) => {
                const t = THEMES.find((x) => x.id === item.themeId);
                const isOpen = expandedKey === item.id;
                const isConfirming = deleteConfirmKey === item.id;
                return (
                  <div key={item.id} className="uw-surface uw-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => setExpandedKey(isOpen ? null : item.id)} className="flex-1 text-left">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className={`uw-tag rounded px-1.5 py-0.5 ${t && t.featured ? "uw-tag-rust" : "uw-tag-ember"}`}>
                            {(item.themeLabel || "").toUpperCase()}
                          </span>
                          <span className="uw-tag uw-tag-teal rounded px-1.5 py-0.5">{(item.triggerLabel || "").toUpperCase()}</span>
                          <span className="uw-tag uw-tag-ember rounded px-1.5 py-0.5">{(item.durationLabel || "").toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="uw-display text-base font-medium uw-ink">{item.title}</span>
                          {isOpen ? <ChevronUp size={14} className="uw-muted" /> : <ChevronDown size={14} className="uw-muted" />}
                        </div>
                        <div className="uw-mono uw-muted text-[10px] mt-1">{timeAgo(item.savedAt)}</div>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        {isConfirming ? (
                          <>
                            <button onClick={() => deleteHistoryItem(item.id)} className="uw-btn-ghost rounded-lg p-2" title="Confirm delete">
                              <Check size={14} className="uw-rust-text" />
                            </button>
                            <button onClick={() => setDeleteConfirmKey(null)} className="uw-btn-ghost rounded-lg p-2" title="Cancel">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirmKey(item.id)} className="uw-btn-ghost rounded-lg p-2" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
                        <div className="mb-3">
                          <div className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1">Hook</div>
                          <p className="uw-display text-base uw-ink">{item.hook}</p>
                        </div>
                        <div className="mb-3 flex flex-col gap-2.5">
                          <div>
                            <div className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1">Problem</div>
                            <p className="text-sm leading-relaxed uw-ink">{item.problem}</p>
                          </div>
                          <div>
                            <div className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1">Empathy</div>
                            <p className="text-sm leading-relaxed uw-ink">{item.empathy}</p>
                          </div>
                          <div>
                            <div className="uw-mono uw-teal-text text-[10px] uppercase tracking-widest mb-1">Answer</div>
                            <p className="text-sm leading-relaxed uw-ink">{item.answer}</p>
                          </div>
                          <div>
                            <div className="uw-mono uw-teal-text text-[10px] uppercase tracking-widest mb-1">Change</div>
                            <p className="text-sm leading-relaxed uw-ink">{item.change}</p>
                          </div>
                          <div>
                            <div className="uw-mono uw-ember-text text-[10px] uppercase tracking-widest mb-1">End Result</div>
                            <p className="text-sm leading-relaxed uw-ink">{item.endResult}</p>
                          </div>
                        </div>
                        <div className="uw-cta-box rounded-lg p-3 mb-3">
                          <div className="uw-mono uw-ember-text text-[10px] uppercase tracking-widest mb-1">CTA</div>
                          <p className="text-sm uw-ink">{item.cta}</p>
                        </div>
                        {item.customBrief && (
                          <div className="uw-surface2 uw-border rounded-lg p-3 mb-3">
                            <div className="uw-mono uw-muted text-[10px] uppercase tracking-widest mb-1">Your idea</div>
                            <p className="text-sm uw-ink">{item.customBrief}</p>
                          </div>
                        )}
                        <button
                          onClick={() => copyText(fullScriptText(item), item.id)}
                          className="uw-btn-ghost rounded-lg px-3 py-2 text-xs uw-mono flex items-center gap-1.5"
                        >
                          {copyFeedback === item.id ? <Check size={14} /> : <Copy size={14} />}
                          {copyFeedback === item.id ? "Copied" : "Copy full script"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
