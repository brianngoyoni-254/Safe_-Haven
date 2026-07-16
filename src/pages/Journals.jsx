import { useState, useMemo } from "react";
import { useAuth } from "../App";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Tag,
  ArrowLeft,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Laugh,
  Loader2,
} from "lucide-react";

// TODO(backend): we will replace all mock logic below with real API calls, e.g.
//   import { listJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from "../api";
// listJournalEntries()          -> GET    /api/journal            -> [{ id, title, content, mood, tags, updatedAt }]
// createJournalEntry(payload)   -> POST   /api/journal            -> created entry
// updateJournalEntry(id, patch) -> PATCH  /api/journal/:id        -> updated entry
// deleteJournalEntry(id)        -> DELETE /api/journal/:id        -> { success: true }



const serif = { fontFamily: "'Fraunces', serif" };

const MOOD_OPTIONS = [
  { value: 1, label: "Very Low", Icon: Frown, color: "#c2417a", bg: "#FCE7EF" },
  { value: 2, label: "Low", Icon: Meh, color: "#d18a4f", bg: "#F6E3D3" },
  { value: 3, label: "Neutral", Icon: Smile, color: "#C98A3E", bg: "#F1DEBC" },
  { value: 4, label: "Good", Icon: SmilePlus, color: "#4a9b7f", bg: "#DCEEE7" },
  { value: 5, label: "Great", Icon: Laugh, color: "#0D6E64", bg: "#D8E8E4" },
];

const SUGGESTED_TAGS = [
  "gratitude",
  "struggle",
  "win",
  "reflection",
  "trigger",
  "coping",
  "family",
  "work",
  "health",
  "hope",
];

const INITIAL_ENTRIES = [];

function moodOption(value) {
  return MOOD_OPTIONS.find((m) => m.value === value);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EntryForm({ entry, onCancel, onSave, saving }) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [mood, setMood] = useState(entry?.mood);
  const [tags, setTags] = useState(entry?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const addTag = (t) => {
    const clean = t.trim().toLowerCase();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError("Please add a title and some content.");
      return;
    }
    setError("");
    onSave({ title: title.trim(), content: content.trim(), mood, tags });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#12302E]">Title</label>
        <input
          type="text"
          placeholder="What's on your mind today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40
            focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[#12302E]">How are you feeling? (optional)</label>
        <div className="flex gap-2 mt-1.5">
          {MOOD_OPTIONS.map(({ value, label, Icon, color, bg }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mood === value}
              onClick={() => setMood(mood === value ? undefined : value)}
              className="flex-1 py-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E64] focus-visible:ring-offset-2"
              style={
                mood === value
                  ? { borderColor: color, background: bg, transform: "scale(1.05)", boxShadow: "0 2px 8px rgba(18,48,46,0.12)" }
                  : { borderColor: "rgba(18,48,46,0.15)" }
              }
            >
              <Icon className="w-5 h-5" style={{ color: mood === value ? color : "#4A544C99" }} />
              <span className="text-[10px] font-semibold" style={{ color: mood === value ? color : "#4A544C99" }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#12302E]">Your entry</label>
        <textarea
          placeholder="Write freely — this is your private, safe space. No one else can see this..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={9}
          className="mt-1.5 w-full resize-none rounded-xl border border-[#12302E]/15 p-3 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40
            leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[#12302E] flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" /> Tags (optional)
        </label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className="flex-1 rounded-xl border border-[#12302E]/15 px-3 py-2 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0D6E64] bg-[#D8E8E4] hover:brightness-95 transition-all cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
            .slice(0, 6)
            .map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="text-xs px-2.5 py-1 rounded-full border border-dashed border-[#12302E]/25 text-[#4A544C]
                  hover:border-[#0D6E64]/50 hover:text-[#0D6E64] transition-colors cursor-pointer"
              >
                + {t}
              </button>
            ))}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tags.map((t) => (
              <span
                key={t}
                onClick={() => removeTag(t)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EFEAE0] text-[#4A544C]
                  hover:bg-[#FCE7EF] hover:text-[#c2417a] transition-colors cursor-pointer"
              >
                {t} <X className="w-3 h-3" />
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-[#0D6E64]
            hover:brightness-110 hover:shadow-lg active:scale-[0.99] transition-all duration-150 cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : entry ? (
            "Update entry"
          ) : (
            "Save entry"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function EntryCard({ entry, onView, onEdit, onDelete }) {
  const mood = entry.mood ? moodOption(entry.mood) : null;
  const MoodIcon = mood?.Icon;

  return (
    <div
      onClick={() => onView(entry)}
      className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer
        p-5 flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-[#12302E] text-sm truncate tracking-tight">{entry.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#4A544C] flex-wrap">
            <span>{formatDate(entry.updatedAt)}</span>
            {mood && (
              <span className="flex items-center gap-1 font-semibold" style={{ color: mood.color }}>
                <MoodIcon className="w-3.5 h-3.5" /> {mood.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(entry)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#4A544C]/60 hover:bg-[#12302E]/10 hover:text-[#12302E] transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#4A544C]/60 hover:bg-[#FCE7EF] hover:text-[#c2417a] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-[#4A544C] leading-relaxed mt-3 line-clamp-3 flex-1">{entry.content}</p>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#EFEAE0] text-[#4A544C]">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewModal({ entry, onClose, onEdit }) {
  if (!entry) return null;
  const mood = entry.mood ? moodOption(entry.mood) : null;
  const MoodIcon = mood?.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12302E]/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#F7F4EC] rounded-[24px] border border-[#12302E]/10 shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium text-[#12302E] tracking-tight" style={serif}>{entry.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-[#4A544C] flex-wrap">
              <span>{formatDateTime(entry.updatedAt)}</span>
              {mood && (
                <span className="flex items-center gap-1 font-semibold" style={{ color: mood.color }}>
                  <MoodIcon className="w-4 h-4" /> {mood.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-[#4A544C]/60 hover:bg-[#12302E]/10 hover:text-[#12302E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#12302E]/90 leading-relaxed whitespace-pre-wrap mt-5">{entry.content}</p>

        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-[#12302E]/10">
            {entry.tags.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#EFEAE0] text-[#4A544C]">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-5">
          <button
            onClick={() => onEdit(entry)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit entry
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ open, onCancel, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12302E]/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-[#F7F4EC] rounded-[24px] border border-[#12302E]/10 shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium text-[#12302E] tracking-tight" style={serif}>Delete this entry?</h2>
        <p className="text-sm text-[#4A544C] mt-2">
          This action cannot be undone. Your journal entry will be permanently deleted.
        </p>
        <div className="flex gap-2 pt-5">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-[#c2417a]
              hover:brightness-110 hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete entry
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Journals() {
  const { user } = useAuth();

  // TODO(backend): seed from listJournalEntries() instead of INITIAL_ENTRIES.
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [view, setView] = useState("list"); // "list" | "create" | "edit"
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.includes(q))
    );
  }, [entries, search]);

  const moodEntries = entries.filter((e) => e.mood);
  const avgMood = moodEntries.length
    ? (moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length).toFixed(1)
    : null;

  const openCreate = () => {
    setEditingEntry(null);
    setView("create");
  };

  const openEdit = (entry) => {
    setEditingEntry(entry);
    setViewingEntry(null);
    setView("edit");
  };

  const backToList = () => {
    setView("list");
    setEditingEntry(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingEntry) {
        // TODO(backend): await updateJournalEntry(editingEntry.id, payload)
        await new Promise((r) => setTimeout(r, 400));
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingEntry.id ? { ...e, ...payload, updatedAt: new Date().toISOString() } : e
          )
        );
      } else {
        // TODO(backend): await createJournalEntry(payload)
        await new Promise((r) => setTimeout(r, 400));
        const newEntry = {
          id: crypto.randomUUID(),
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        setEntries((prev) => [newEntry, ...prev]);
      }
      backToList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      // TODO(backend): await deleteJournalEntry(id)
      await new Promise((r) => setTimeout(r, 400));
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={backToList}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#4A544C] hover:text-[#12302E] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-medium text-[#12302E] tracking-tight" style={serif}>
            {view === "edit" ? "Edit entry" : "New journal entry"}
          </h1>
        </div>

        <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
          <EntryForm entry={editingEntry} onCancel={backToList} onSave={handleSave} saving={saving} />
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
            Private Journal
          </h1>
          <p className="text-[#4A544C] text-sm mt-1.5">
            Your entries are completely private and only visible to you{user?.username ? `, ${user.username}` : ""}.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
            shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New entry
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A544C]/50" />
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#12302E]/15 text-sm text-[#12302E] placeholder-[#4A544C]/40
            focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow bg-white"
        />
      </div>

      {/* Stats bar */}
      {entries.length > 0 && (
        <div className="flex gap-4 text-sm text-[#4A544C] flex-wrap">
          <span>
            <strong className="text-[#12302E]">{entries.length}</strong> {entries.length === 1 ? "entry" : "entries"}
          </span>
          {avgMood && (
            <span>
              Avg mood: <strong className="text-[#12302E]">{avgMood}/5</strong>
            </span>
          )}
        </div>
      )}

      {/* Entries grid / empty states */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm">
          <BookOpen className="w-10 h-10 text-[#4A544C]/30 mx-auto mb-3" />
          {search ? (
            <p className="text-[#4A544C] text-sm">No entries match your search.</p>
          ) : (
            <>
              <p className="font-semibold text-[#12302E] mb-1">Start your recovery journal</p>
              <p className="text-sm text-[#4A544C] mb-5 max-w-xs mx-auto">
                Writing regularly can help reduce stress, process emotions, and strengthen your recovery.
              </p>
              <button
                onClick={openCreate}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
                  shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                Write your first entry
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onView={setViewingEntry}
              onEdit={openEdit}
              onDelete={setDeleteConfirmId}
            />
          ))}
        </div>
      )}

      <ViewModal entry={viewingEntry} onClose={() => setViewingEntry(null)} onEdit={openEdit} />

      <DeleteConfirmModal
        open={!!deleteConfirmId}
        deleting={deleting}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDelete(deleteConfirmId)}
      />
    </div>
  );
}