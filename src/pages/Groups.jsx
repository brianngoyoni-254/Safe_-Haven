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
  Pencil,
  Check,
  Globe,
  ExternalLink,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Brain,
  Phone,
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
// editMessage(groupId, msgId, text)   -> PATCH  /api/groups/:id/messages/:msgId -> Message
// deleteMessage(groupId, msgId)       -> DELETE /api/groups/:id/messages/:msgId -> void
// Ideally getMessages is backed by a live subscription (WebSocket/SSE/polling)
// so new messages from other members show up without a refresh.
// Only a message's author (or an organizer, if added later) should be
// allowed to edit/delete it — enforce this server-side too; the isMine
// check in the UI below is just a convenience for hiding the controls.



const serif = { fontFamily: "'Fraunces', serif" };

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

// Pastel category badges — kept distinct per category for scannability, but
// pulled toward the warm/muted palette used across the rest of the product
// rather than saturated stock Tailwind hues.
const CATEGORY_STYLES = {
  "Substance Recovery": "bg-[#D8E8E4] text-[#0D6E64]",
  "Alcohol Recovery": "bg-[#F1DEBC] text-[#8a5a1f]",
  "Mental Health": "bg-[#E7E0F3] text-[#5b4a8a]",
  "Grief & Loss": "bg-[#EFEAE0] text-[#4A544C]",
  "Family Support": "bg-[#FCE7EF] text-[#c2417a]",
  "LGBTQ+ Recovery": "bg-[#FBE4EE] text-[#a83e78]",
  "Women's Group": "bg-[#F5E3F0] text-[#8a3e7a]",
  "Men's Group": "bg-[#DDF0F3] text-[#1c7fa8]",
  "Young Adults (18-30)": "bg-[#E7F0D8] text-[#5c7a2e]",
  "Faith-Based": "bg-[#F1E2D0] text-[#9a5f2a]",
  "Trauma & PTSD": "bg-[#DCE6F5] text-[#2f5da8]",
  "General Wellness": "bg-[#E3F5EC] text-[#0d9668]",
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

// External support groups — independent organizations Safe Haven does not run or
// moderate. TODO(backend): if this ever needs to be editable without a redeploy,
// move it behind GET /api/external-groups; for now it's a curated, hand-verified
// list of established fellowships and directories (Kenyan and international).
// Every entry links out to the organization's own site — Safe Haven never hosts
// their meetings or content. Verify links/numbers periodically, as they can change.
const EXTERNAL_CATEGORIES = [
  {
    id: "kenya",
    label: "Kenya-Based Fellowships",
    blurb: "In-person and hybrid meetings run by established fellowships across Kenya.",
    Icon: Compass,
    iconBg: "bg-[#D8E8E4]",
    iconColor: "text-[#0D6E64]",
    badge: "bg-[#D8E8E4] text-[#0D6E64] border-[#0D6E64]/15",
    groups: [
      {
        name: "AA Kenya Intergroup",
        org: "Alcoholics Anonymous",
        desc: "National fellowship with in-person meetings in Nairobi, Mombasa, the Coast, and other towns, plus roughly 25 weekly Zoom meetings for members anywhere in Kenya.",
        url: "https://aa-kenya.or.ke",
        format: "In-person & Zoom",
      },
      {
        name: "Narcotics Anonymous Kenya",
        org: "Narcotics Anonymous",
        desc: "Peer-led, anonymous recovery meetings for anyone with a drug problem, with a growing network of groups based in and around Nairobi.",
        url: "https://www.nakenya.com",
        format: "In-person & online",
      },
      {
        name: "NA Africa — Nairobi Meetings",
        org: "Narcotics Anonymous",
        desc: "Regional NA meeting directory listing in-person meetings in Nairobi (Parklands) alongside other East and West African cities.",
        url: "https://naafrica.org/meetings/nairobi/",
        format: "In-person",
      },
    ],
  },
  {
    id: "global",
    label: "Global Online Fellowships",
    blurb: "Established 12-step fellowships offering meetings around the clock, in every time zone.",
    Icon: Globe,
    iconBg: "bg-[#DDF0F3]",
    iconColor: "text-[#1c7fa8]",
    badge: "bg-[#DDF0F3] text-[#1c7fa8] border-[#1c7fa8]/15",
    groups: [
      {
        name: "Online Intergroup of AA (OIAA)",
        org: "Alcoholics Anonymous",
        desc: "The official worldwide directory of AA meetings held online, by phone, and by chat — reachable from anywhere with internet, any hour of the day.",
        url: "https://aa-intergroup.org/meetings/",
        format: "Online, 24/7",
      },
      {
        name: "In The Rooms",
        org: "Multi-fellowship community",
        desc: "A free global recovery social network with 150+ weekly live video meetings spanning AA, NA, Al-Anon, and several non-12-step programs.",
        url: "https://www.intherooms.com",
        format: "Live video meetings",
      },
      {
        name: "Al-Anon Family Groups",
        org: "Al-Anon / Alateen",
        desc: "Support for the family and friends of someone whose drinking has affected them — a worldwide directory that includes electronic and hybrid meetings.",
        url: "https://al-anon.org/al-anon-meetings/find-an-al-anon-meeting/",
        format: "In-person & electronic",
      },
    ],
  },
  {
    id: "secular",
    label: "Secular & Evidence-Based",
    blurb: "Non-12-step, science-based support for anyone who prefers a different approach.",
    Icon: Brain,
    iconBg: "bg-[#E7E0F3]",
    iconColor: "text-[#5b4a8a]",
    badge: "bg-[#E7E0F3] text-[#5b4a8a] border-[#5b4a8a]/15",
    groups: [
      {
        name: "SMART Recovery Global",
        org: "SMART Recovery",
        desc: "Secular, CBT-based mutual-support meetings for any addictive behavior, with hundreds of free online sessions across multiple languages and time zones.",
        url: "https://smartrecoveryglobal.org/meeting",
        format: "Online, multilingual",
      },
    ],
  },
];

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
  const catStyle = CATEGORY_STYLES[group.category] ?? "bg-[#EFEAE0] text-[#4A544C]";

  return (
    <div
      className={`bg-[#F7F4EC] rounded-[20px] border shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
        group.isMember ? "border-[#0D6E64]/30" : "border-[#12302E]/10"
      }`}
    >
      {group.isMember && <div className="h-1" style={{ background: "linear-gradient(90deg, #0D6E64, #C98A3E)" }} />}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-[#12302E] tracking-tight flex items-center gap-1.5 flex-wrap">
            {group.isPrivate && <Lock className="w-3.5 h-3.5 text-[#4A544C]/50 flex-shrink-0" />}
            <span>{group.name}</span>
            {group.isMember && (
              <span className="text-xs font-semibold text-[#0D6E64] bg-[#D8E8E4] border border-[#0D6E64]/15 rounded-full px-2 py-0.5">
                Joined
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catStyle}`}>{group.category}</span>
            <span className="text-xs text-[#4A544C] flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {group.memberCount} members
            </span>
          </div>
        </div>

        <p className="text-sm text-[#4A544C] leading-relaxed line-clamp-2">{group.description}</p>

        {group.meetingSchedule && (
          <div className="flex items-center gap-1.5 text-xs text-[#4A544C] bg-[#EFEAE0] rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{group.meetingSchedule}</span>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-1">
          {group.isMember ? (
            <>
              <button
                onClick={() => onOpenChat(group)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-[#F7F4EC] bg-[#0D6E64]
                  shadow-sm hover:brightness-110 hover:shadow-md transition-all duration-150 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Open Chat
              </button>
              <button
                disabled={busy}
                onClick={() => onLeave(group)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => onJoin(group)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-[#F7F4EC] bg-[#0D6E64]
                shadow-sm hover:brightness-110 hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              Join Group
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={() => onDelete(group)}
              className="flex items-center justify-center px-2.5 py-2.5 rounded-full text-[#4A544C]/60 bg-[#EFEAE0] hover:bg-[#FCE7EF] hover:text-[#c2417a] transition-colors cursor-pointer"
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
      <div className="absolute inset-0 bg-[#12302E]/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#F7F4EC] rounded-[24px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-xl font-medium text-[#12302E] tracking-tight" style={serif}>Create a Support Group</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-[#4A544C]/60 hover:bg-[#12302E]/10 hover:text-[#12302E] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#12302E]">
              Group name <span className="text-[#c2417a]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Morning Recovery Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40 focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#12302E]">
              Description <span className="text-[#c2417a]">*</span>
            </label>
            <textarea
              placeholder="What is this group about? Who is it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40 focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#12302E]">
              Category <span className="text-[#c2417a]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow cursor-pointer"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#12302E]">Meeting schedule</label>
            <input
              type="text"
              placeholder="e.g. Every Monday 7pm EST via Zoom"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40 focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-[#EFEAE0] rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#0D6E64]"
            />
            <div>
              <p className="text-sm font-medium text-[#12302E]">Private group</p>
              <p className="text-xs text-[#4A544C]">Only visible to approved members</p>
            </div>
          </label>

          {error && (
            <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-[#0D6E64]
              hover:brightness-110 hover:shadow-lg active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

// Group chat

function GroupChat({ group, user, onBack, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const bottomRef = useRef(null);
  const editInputRef = useRef(null);
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

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditDraft(message.text);
    // focus after the textarea has rendered in place of the bubble
    requestAnimationFrame(() => editInputRef.current?.focus());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleSaveEdit = async () => {
    const text = editDraft.trim();
    const editingMessageId = editingId;
    if (!text || !editingMessageId) return;
    setIsSavingEdit(true);
    try {
      // TODO(backend): const saved = await editMessage(group.id, editingMessageId, text);
      await new Promise((r) => setTimeout(r, 250)); // simulated save
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessageId ? { ...m, text, editedAt: Date.now() } : m
        )
      );
      setEditingId(null);
      setEditDraft("");
    } catch {
      // TODO(backend): surface an inline error and keep the editor open so the user can retry
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (message) => {
    // Optimistically remove; roll back if the request fails.
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    if (editingId === message.id) cancelEdit();
    try {
      // TODO(backend): await deleteMessage(group.id, message.id);
    } catch {
      // TODO(backend): roll back — re-insert `message` into state and surface an error
    }
  };

  const catStyle = CATEGORY_STYLES[group.category] ?? "bg-[#EFEAE0] text-[#4A544C]";

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-[#F7F4EC] rounded-[24px] border border-[#12302E]/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#12302E]/10">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg text-[#4A544C]/60 hover:bg-[#12302E]/10 hover:text-[#12302E] cursor-pointer"
          aria-label="Back to groups"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[#12302E] tracking-tight truncate flex items-center gap-1.5">
            {group.isPrivate && <Lock className="w-3.5 h-3.5 text-[#4A544C]/50 flex-shrink-0" />}
            {group.name}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle}`}>{group.category}</span>
            <span className="text-xs text-[#4A544C] flex items-center gap-1">
              <Users className="w-3 h-3" /> {group.memberCount} members
            </span>
          </div>
        </div>
        <button
          onClick={() => onLeave(group)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Leave
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#EFEAE0]">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                <div className="h-12 w-2/3 bg-[#12302E]/10 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <MessageCircle className="w-8 h-8 text-[#4A544C]/30 mb-3" />
            <p className="font-medium text-[#12302E] text-sm">No messages yet</p>
            <p className="text-xs text-[#4A544C]/60 mt-1">Be the first to say hello to the group.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.authorId === uid;
            const isEditing = editingId === m.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <span className="text-xs font-medium text-[#4A544C] px-1">
                    {isMine ? uname : m.authorName}
                    {isMine && <span className="text-[#4A544C]/60 font-normal"> (you)</span>}
                  </span>

                  {isEditing ? (
                    <div className="w-full min-w-[220px] flex flex-col gap-1.5">
                      <textarea
                        ref={editInputRef}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-[#0D6E64]/40 px-3.5 py-2.5 text-sm text-[#12302E] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[#12302E] bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editDraft.trim() || isSavingEdit}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-[#0D6E64] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingEdit ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {isMine && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity order-first">
                          <button
                            onClick={() => startEdit(m)}
                            aria-label="Edit message"
                            className="p-1.5 rounded-lg text-[#4A544C]/50 hover:bg-[#12302E]/10 hover:text-[#12302E] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(m)}
                            aria-label="Delete message"
                            className="p-1.5 rounded-lg text-[#4A544C]/50 hover:bg-[#FCE7EF] hover:text-[#c2417a] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine
                            ? "bg-[#0D6E64] text-[#F7F4EC] rounded-br-sm"
                            : "bg-[#F7F4EC] text-[#12302E] border border-[#12302E]/10 rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] text-[#4A544C]/60 px-1">
                    {formatTime(m.createdAt)}
                    {m.editedAt && " · edited"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[#12302E]/10 p-3 flex items-end gap-2 bg-[#F7F4EC]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message to the group…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[#12302E]/15 px-3.5 py-2.5 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40 focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#0D6E64] text-[#F7F4EC] shadow-sm hover:brightness-110 hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          {isSending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
        </button>
      </div>
    </div>
  );
}

// External groups section 

function ExternalGroupCard({ group, badgeStyle }) {
  return (
    <a
      href={group.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-[#12302E]/10 bg-[#F7F4EC] p-4 hover:border-[#0D6E64]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-[#12302E] text-sm leading-snug">{group.name}</h3>
        <ExternalLink className="w-3.5 h-3.5 text-[#4A544C]/40 group-hover:text-[#0D6E64] flex-shrink-0 mt-0.5 transition-colors" />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeStyle}`}>{group.format}</span>
        <span className="text-xs text-[#4A544C]/60">{group.org}</span>
      </div>
      <p className="text-xs text-[#4A544C] leading-relaxed">{group.desc}</p>
    </a>
  );
}

function ExternalGroups() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return EXTERNAL_CATEGORIES;
    return EXTERNAL_CATEGORIES
      .map((cat) => ({
        ...cat,
        groups: cat.groups.filter((g) =>
          g.name.toLowerCase().includes(q) ||
          g.org.toLowerCase().includes(q) ||
          g.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.groups.length > 0);
  }, [search]);

  return (
    <div className="space-y-5">
      {/* Trust banner */}
      <div className="flex items-start gap-3 bg-[#D8E8E4]/60 border border-[#0D6E64]/15 rounded-[20px] p-4">
        <ShieldCheck className="w-5 h-5 text-[#0D6E64] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#4A544C]">
          These are established, independent recovery organizations — Safe Haven doesn't run,
          moderate, or profit from any of them. Each card links out to the organization's own
          site so you can review their meeting schedule and join directly.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A544C]/50" />
        <input
          type="text"
          placeholder="Search external groups by name or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#12302E]/15 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40
            focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-[#4A544C]/60 italic px-1 py-10 text-center">
          No external groups match your search.
        </div>
      )}

      {/* Category sections */}
      {filtered.map((cat) => (
        <section key={cat.id} className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center flex-shrink-0`}>
              <cat.Icon className={`w-5 h-5 ${cat.iconColor}`} />
            </div>
            <div>
              <h2 className="font-semibold text-[#12302E] tracking-tight">{cat.label}</h2>
              <p className="text-xs text-[#4A544C]">{cat.blurb}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {cat.groups.map((g) => (
              <ExternalGroupCard key={g.name} group={g} badgeStyle={cat.badge} />
            ))}
          </div>
        </section>
      ))}

      {/* Reassurance / crisis footer */}
      <div className="bg-[#EFEAE0] border border-[#12302E]/10 rounded-[20px] p-5 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-[#0D6E64] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#4A544C]">
          Trying an external meeting doesn't replace your Safe Haven community — think of it as
          another door into support, especially outside the hours your groups here are active.
          If you're in crisis right now, visit <span className="font-medium text-[#12302E]">Crisis Support</span>{" "}
          or call the NACADA National Helpline on{" "}
          <a href="tel:1192" className="text-[#0D6E64] font-semibold underline inline-flex items-center gap-1">
            <Phone className="w-3 h-3" /> 1192
          </a>
          .
        </p>
      </div>
    </div>
  );
}

//  Main page 

export default function Groups() {
  const { user } = useAuth();

  const [page, setPage] = useState("community"); // "community" | "external"
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
      <GroupChat
        group={liveActiveGroup}
        user={user}
        onBack={() => setActiveGroup(null)}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
            Support Groups
          </h1>
          <p className="text-[#4A544C] text-sm mt-1.5">
            {page === "community"
              ? "Connect with people who understand your journey."
              : "Established fellowships and directories beyond Safe Haven, in Kenya and worldwide."}
          </p>
        </div>
        {page === "community" && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Group
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 border-b border-[#12302E]/10">
        <button
          onClick={() => setPage("community")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${
              page === "community"
                ? "border-[#0D6E64] text-[#0D6E64]"
                : "border-transparent text-[#4A544C] hover:text-[#12302E]"
            }`}
        >
          <Users className="w-4 h-4" /> Safe Haven Groups
        </button>
        <button
          onClick={() => setPage("external")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${
              page === "external"
                ? "border-[#0D6E64] text-[#0D6E64]"
                : "border-transparent text-[#4A544C] hover:text-[#12302E]"
            }`}
        >
          <Globe className="w-4 h-4" /> External Groups
        </button>
      </div>

      {page === "external" && <ExternalGroups />}

      {page === "community" && (
      <>
      {/* Tabs */}
      <div className="flex gap-1 bg-[#EFEAE0] p-1 rounded-full w-fit">
        {[
          { key: "all", label: "All Groups" },
          { key: "mine", label: "My Groups" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              tab === t.key ? "bg-[#F7F4EC] shadow-sm text-[#12302E]" : "text-[#4A544C] hover:text-[#12302E]"
            }`}
          >
            {t.label}
            {t.key === "mine" && myGroupsCount > 0 && (
              <span className="ml-1.5 bg-[#0D6E64] text-[#F7F4EC] text-xs px-1.5 py-0.5 rounded-full">
                {myGroupsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A544C]/50" />
          <input
            type="text"
            placeholder="Search groups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#12302E]/15 text-sm text-[#12302E] bg-white placeholder-[#4A544C]/40 focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow bg-white cursor-pointer"
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
            <div key={i} className="h-56 bg-[#EFEAE0] rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-[#4A544C]/30 mx-auto mb-3" />
          {tab === "mine" ? (
            <>
              <p className="font-semibold text-[#12302E] mb-1">{"You haven't joined any groups yet"}</p>
              <p className="text-sm text-[#4A544C] mb-4">Browse all groups to find your community.</p>
              <button
                onClick={() => setTab("all")}
                className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
                  shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                Browse Groups
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#12302E] mb-1">No groups found</p>
              <p className="text-sm text-[#4A544C] mb-4">Be the first to create a support group.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
                  shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
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
      </>
      )}
    </div>
  );
}