import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../App";
import {
  Users,
  Plus,
  LogIn,
  LogOut,
  Lock,
  Trash2,
  Search,
  Calendar,
  MessageCircle,
  Send,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";

// TODO(backend): replace every helper in this block with real API calls, e.g.
//   import { listGroups, myGroups, createGroup, joinGroup, leaveGroup,
//            deleteGroup, getMessages, sendMessage } from "../api";
// listGroups()                -> GET  /api/groups                 -> Group[]
// myGroups()                  -> GET  /api/groups/mine             -> Group[]
// createGroup(payload)        -> POST /api/groups                  -> Group
// joinGroup(groupId)          -> POST /api/groups/:id/join          -> Group
// leaveGroup(groupId)         -> POST /api/groups/:id/leave         -> Group
// deleteGroup(groupId)        -> DELETE /api/groups/:id             -> void
// getMessages(groupId)        -> GET  /api/groups/:id/messages      -> Message[]
// sendMessage(groupId, text)  -> POST /api/groups/:id/messages      -> Message
// Ideally getMessages is backed by a live subscription (WebSocket/SSE/polling)
// so new messages from other members show up without a refresh.

const CATEGORIES = [
  "Substance Recovery",
  "Alcohol Recovery",
  "Mental Health",
  "Grief & Loss",
  "Family Support",
  "LGBTQ+ Recovery",
  "Women's Group",
  "Men's Group",
  "Young Adults (18-30)",
  "Faith-Based",
  "Trauma & PTSD",
  "General Wellness",
];

const CATEGORY_STYLES = {
  "Substance Recovery": "bg-teal-50 text-teal-700",
  "Alcohol Recovery": "bg-amber-50 text-amber-700",
  "Mental Health": "bg-violet-50 text-violet-700",
  "Grief & Loss": "bg-slate-100 text-slate-600",
  "Family Support": "bg-rose-50 text-rose-600",
  "LGBTQ+ Recovery": "bg-pink-50 text-pink-700",
  "Women's Group": "bg-fuchsia-50 text-fuchsia-700",
  "Men's Group": "bg-sky-50 text-sky-700",
  "Young Adults (18-30)": "bg-lime-50 text-lime-700",
  "Faith-Based": "bg-orange-50 text-orange-700",
  "Trauma & PTSD": "bg-blue-50 text-blue-700",
  "General Wellness": "bg-emerald-50 text-emerald-700",
};

// TODO(backend): seed data only — remove once listGroups()/myGroups() are wired up.
const MOCK_GROUPS = [
  {
    id: "g1",
    name: "Morning Recovery Circle",
    description:
      "A calm space to check in before the day starts. We share wins, struggles, and coffee (virtually).",
    category: "Substance Recovery",
    organizerId: "u1",
    organizerName: "Jordan",
    memberCount: 24,
    isPrivate: false,
    meetingSchedule: "Every day, 7:00 AM EST via video",
    isMember: true,
  },
  {
    id: "g2",
    name: "Sober Parents Support",
    description:
      "For parents balancing recovery with raising kids. Judgment-free, practical, and honest.",
    category: "Family Support",
    organizerId: "u2",
    organizerName: "Alex",
    memberCount: 41,
    isPrivate: false,
    meetingSchedule: "Tuesdays & Thursdays, 8:00 PM EST",
    isMember: true,
  },
  {
    id: "g3",
    name: "Young Adults in Recovery",
    description:
      "18-30 crowd navigating school, work, and dating while staying sober. You're not alone in this.",
    category: "Young Adults (18-30)",
    organizerId: "u3",
    organizerName: "Sam",
    memberCount: 63,
    isPrivate: false,
    meetingSchedule: "Sundays, 6:00 PM EST",
    isMember: false,
  },
  {
    id: "g4",
    name: "Grief After Loss",
    description:
      "Processing grief tied to addiction and loss, together. A gentle, listening-first group.",
    category: "Grief & Loss",
    organizerId: "u4",
    organizerName: "Riley",
    memberCount: 18,
    isPrivate: true,
    meetingSchedule: "Wednesdays, 7:30 PM EST",
    isMember: false,
  },
  {
    id: "g5",
    name: "Women's Wellness Circle",
    description:
      "A women-only space focused on holistic recovery — mind, body, and community.",
    category: "Women's Group",
    organizerId: "u5",
    organizerName: "Morgan",
    memberCount: 37,
    isPrivate: false,
    meetingSchedule: "Mondays, 6:30 PM EST",
    isMember: false,
  },
  {
    id: "g6",
    name: "Faith & Recovery",
    description:
      "Leaning on faith as part of the healing process. All denominations welcome.",
    category: "Faith-Based",
    organizerId: "u6",
    organizerName: "Casey",
    memberCount: 29,
    isPrivate: false,
    meetingSchedule: "Saturdays, 10:00 AM EST",
    isMember: false,
  },
];

// TODO(backend): seed data only — remove once getMessages()/sendMessage() are wired up.
const MOCK_MESSAGES = {
  g1: [
    { id: "m1", authorId: "u1", authorName: "Jordan", text: "Good morning everyone! How'd last night go?", createdAt: Date.now() - 1000 * 60 * 62 },
    { id: "m2", authorId: "u9", authorName: "Taylor", text: "Rough night but I made it through. Grateful for this group.", createdAt: Date.now() - 1000 * 60 * 48 },
    { id: "m3", authorId: "u7", authorName: "Devon", text: "Proud of you, Taylor. That's what counts.", createdAt: Date.now() - 1000 * 60 * 40 },
  ],
  g2: [
    { id: "m4", authorId: "u2", authorName: "Alex", text: "Reminder: meeting moved to 8pm tonight, not 7.", createdAt: Date.now() - 1000 * 60 * 200 },
  ],
};

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function currentUserId(user) {
  return user?.id ?? user?._id ?? user?.username ?? "me";
}

function currentUserName(user) {
  return user?.username ?? user?.displayName ?? "You";
}

// Group card 

function GroupCard({ group, isOrganizer, onJoin, onLeave, onDelete, onOpenChat, busy }) {
  const catStyle = CATEGORY_STYLES[group.category] ?? "bg-gray-100 text-gray-600";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
        group.isMember ? "border-teal-200" : "border-gray-100"
      }`}
    >
      {group.isMember && <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
            {group.isPrivate && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
            <span>{group.name}</span>
            {group.isMember && (
              <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
                Joined
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catStyle}`}>{group.category}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {group.memberCount} members
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{group.description}</p>

        {group.meetingSchedule && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{group.meetingSchedule}</span>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-1">
          {group.isMember ? (
            <>
              <button
                onClick={() => onOpenChat(group)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Open Chat
              </button>
              <button
                disabled={busy}
                onClick={() => onLeave(group)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => onJoin(group)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              Join Group
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={() => onDelete(group)}
              className="flex items-center justify-center px-2.5 py-2 rounded-lg text-gray-400 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Delete group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create group modal 

function CreateGroupModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [schedule, setSchedule] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName("");
    setDescription("");
    setCategory("");
    setSchedule("");
    setIsPrivate(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !category) {
      setError("Please fill in the required fields.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        category,
        meetingSchedule: schedule.trim() || undefined,
        isPrivate,
      });
      reset();
      onClose();
    } catch {
      setError("Couldn't create the group. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-bold text-gray-900">Create a Support Group</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Group name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Morning Recovery Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="What is this group about? Who is it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow bg-white cursor-pointer"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Meeting schedule</label>
            <input
              type="text"
              placeholder="e.g. Every Monday 7pm EST via Zoom"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-teal-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Private group</p>
              <p className="text-xs text-gray-500">Only visible to approved members</p>
            </div>
          </label>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-500 active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Group chat ----------

function GroupChat({ group, user, onBack, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const uid = currentUserId(user);
  const uname = currentUserName(user);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      // TODO(backend): const data = await getMessages(group.id);
      await new Promise((r) => setTimeout(r, 300)); // simulated fetch
      if (!cancelled) setMessages(MOCK_MESSAGES[group.id] ?? []);
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setDraft("");

    const optimistic = {
      id: `tmp-${Date.now()}`,
      authorId: uid,
      authorName: uname,
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      // TODO(backend): const saved = await sendMessage(group.id, text);
      await new Promise((r) => setTimeout(r, 250)); // simulated send
      // TODO(backend): reconcile optimistic message with `saved` from the server
      // (swap the temp id for the real id, real timestamp, etc.)
    } catch {
      // TODO(backend): surface a retry affordance and roll back the optimistic message on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const catStyle = CATEGORY_STYLES[group.category] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          aria-label="Back to groups"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900 truncate flex items-center gap-1.5">
            {group.isPrivate && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
            {group.name}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle}`}>{group.category}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" /> {group.memberCount} members
            </span>
          </div>
        </div>
        <button
          onClick={() => onLeave(group)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Leave
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                <div className="h-12 w-2/3 bg-gray-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <MessageCircle className="w-8 h-8 text-gray-300 mb-3" />
            <p className="font-medium text-gray-700 text-sm">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to say hello to the group.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.authorId === uid;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMine && <span className="text-xs font-medium text-gray-500 px-1">{m.authorName}</span>}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMine
                        ? "bg-teal-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[11px] text-gray-400 px-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 p-3 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message to the group…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          {isSending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
        </button>
      </div>
    </div>
  );
}

//  Main page 

export default function Groups() {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null); // group currently open in chat

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      // TODO(backend): const data = await listGroups();
      await new Promise((r) => setTimeout(r, 300)); // simulated fetch
      if (!cancelled) {
        setGroups(MOCK_GROUPS);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const myGroupsCount = useMemo(() => groups.filter((g) => g.isMember).length, [groups]);

  const filtered = useMemo(() => {
    const base = tab === "mine" ? groups.filter((g) => g.isMember) : groups;
    const q = search.trim().toLowerCase();
    return base.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || g.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [groups, tab, search, categoryFilter]);

  const handleJoin = async (group) => {
    setBusyId(group.id);
    try {
      // TODO(backend): await joinGroup(group.id);
      await new Promise((r) => setTimeout(r, 400)); // simulated request
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (group) => {
    setBusyId(group.id);
    try {
      // TODO(backend): await leaveGroup(group.id);
      await new Promise((r) => setTimeout(r, 400)); // simulated request
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id ? { ...g, isMember: false, memberCount: Math.max(0, g.memberCount - 1) } : g
        )
      );
      setActiveGroup((current) => (current?.id === group.id ? null : current));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (group) => {
    // TODO(backend): await deleteGroup(group.id);
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    setActiveGroup((current) => (current?.id === group.id ? null : current));
  };

  const handleCreate = async (payload) => {
    // TODO(backend): const created = await createGroup(payload);
    await new Promise((r) => setTimeout(r, 500)); // simulated request
    const created = {
      id: `g-${Date.now()}`,
      organizerId: currentUserId(user),
      organizerName: currentUserName(user),
      memberCount: 1,
      isMember: true,
      ...payload,
    };
    setGroups((prev) => [created, ...prev]);
  };

  const handleOpenChat = (group) => setActiveGroup(group);

  // Keep the chat header's member count / joined state in sync with the list.
  const liveActiveGroup = activeGroup ? groups.find((g) => g.id === activeGroup.id) ?? activeGroup : null;

  if (liveActiveGroup) {
    return (
      <div className="p-4 md:p-6">
        <GroupChat
          group={liveActiveGroup}
          user={user}
          onBack={() => setActiveGroup(null)}
          onLeave={handleLeave}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Groups</h1>
          <p className="text-gray-500 text-sm mt-1">Connect with people who understand your journey.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-500 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "all", label: "All Groups" },
          { key: "mine", label: "My Groups" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
            {t.key === "mine" && myGroupsCount > 0 && (
              <span className="ml-1.5 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {myGroupsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow bg-white cursor-pointer"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          {tab === "mine" ? (
            <>
              <p className="font-medium text-gray-800 mb-1">{"You haven't joined any groups yet"}</p>
              <p className="text-sm text-gray-500 mb-4">Browse all groups to find your community.</p>
              <button
                onClick={() => setTab("all")}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer"
              >
                Browse Groups
              </button>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-800 mb-1">No groups found</p>
              <p className="text-sm text-gray-500 mb-4">Be the first to create a support group.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer"
              >
                Create Group
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              isOrganizer={g.organizerId === currentUserId(user)}
              busy={busyId === g.id}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onDelete={handleDelete}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
      )}

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
    </div>
  );
}