import { Link } from "react-router-dom";
import type { KnownUser } from "../../utils/mentions.ts";

/**
 * Renders post/comment text with #tags as links to the feed search and
 * @mentions as links to the mentioned user's profile — but only when the
 * username is in the known-users map (pass `knownUsers`). A mention of a
 * user NOT in the map renders as plain text: never a broken link, never a
 * guessed id. Without `knownUsers` this behaves exactly as before
 * (hashtags only).
 */
export default function HashtagText({
  text,
  knownUsers,
}: {
  text: string;
  knownUsers?: Map<string, KnownUser>;
}) {
  const parts = text.split(/([#@][\p{L}\p{N}_]+)/gu);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          const tag = part.slice(1);
          return (
            <Link key={index} to={`/tags/${encodeURIComponent(tag)}`} className="hashtag-link">
              #{tag}
            </Link>
          );
        }
        if (part.startsWith("@") && knownUsers) {
          const mentioned = knownUsers.get(part.slice(1).toLowerCase());
          if (mentioned) {
            return (
              <Link key={index} to={`/users/${mentioned._id}`} className="mention-link">
                @{mentioned.username}
              </Link>
            );
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
