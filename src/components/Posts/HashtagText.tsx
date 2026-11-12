import { Link } from "react-router-dom";

/** Renders post text with #tags as links to the feed search for that tag. */
export default function HashtagText({ text }: { text: string }) {
  const parts = text.split(/#([\p{L}\p{N}_]+)/gu);
  return (
    <>
      {parts.map((part, index) =>
        // Odd indices are the captured tag names (without the "#").
        index % 2 === 1 ? (
          <Link key={index} to={`/?q=%23${encodeURIComponent(part)}`} className="hashtag-link">
            #{part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
