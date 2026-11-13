// Round 5 M1 — @mentions: client-side only resolution.
// A mention is ONLY a link when the username is already known to the app
// (post authors, suggestions, followers/following, likers, comment authors).
// Anything else stays plain text — never a broken link, never a guessed id.

export interface KnownUser {
  _id: string;
  name: string;
  username: string;
  photo?: string | null;
}

/** Build a username → user map (keyed lowercase). First entry wins. */
export function buildKnownUsersMap(users: (KnownUser | null | undefined)[]): Map<string, KnownUser> {
  const map = new Map<string, KnownUser>();
  for (const user of users) {
    if (!user?._id || !user.username) continue;
    const key = user.username.toLowerCase();
    if (!map.has(key)) map.set(key, user);
  }
  return map;
}

/** A mention is "@" + letters/digits/underscore (same charset as hashtags). */
export const MENTION_PATTERN = /@([\p{L}\p{N}_]+)/gu;

/**
 * If the caret sits right after "@query" (a partial mention being typed),
 * return the query and the "@" position. Otherwise null.
 */
export function findMentionQuery(text: string, caret: number): { query: string; start: number } | null {
  const before = text.slice(0, caret);
  const match = /@([\p{L}\p{N}_]*)$/u.exec(before);
  if (!match) return null;
  return { query: match[1], start: caret - match[0].length };
}

/** Replace the "@query" under the caret with "@username " and return the new text + caret. */
export function insertMention(
  text: string,
  caret: number,
  username: string,
): { text: string; caret: number } | null {
  const mention = findMentionQuery(text, caret);
  if (!mention) return null;
  const replacement = `@${username} `;
  return {
    text: text.slice(0, mention.start) + replacement + text.slice(caret),
    caret: mention.start + replacement.length,
  };
}

/** Insert a string at the caret (or append at the end when no caret is known). */
export function insertAtCursor(
  text: string,
  caret: number | null,
  insertion: string,
): { text: string; caret: number } {
  const pos = caret ?? text.length;
  return { text: text.slice(0, pos) + insertion + text.slice(pos), caret: pos + insertion.length };
}

// Round 5 M3 — composer drafts: text only, per user, never leaves the device.
// Image attachments are NOT persisted.
export function composerDraftKey(userId: string): string {
  return `magic-social:composer-draft:${userId}`;
}

/** Curated built-in emoji set — no new dependency. */
export const COMPOSER_EMOJIS: string[] = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎",
  "🤔", "😴", "😭", "😡", "🥳", "😇", "🤩", "😜",
  "👍", "👏", "🙏", "👋", "💪", "🫶", "❤️", "🔥",
  "🎉", "🎂", "⚽", "🏆", "🎮", "🎵", "📸", "☕",
  "🌙", "☀️", "🌈", "⭐", "💡", "✨", "🚀", "🎯",
];
