import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuggestions } from "../api/Users/api.ts";
import { useAuth } from "../context/useAuth.ts";
import { buildKnownUsersMap, type KnownUser } from "../utils/mentions.ts";

/**
 * Round 5 M1 — the known-users map, built only from data the app already
 * loads: follow suggestions (fetched here once, shared with the sidebar
 * card via the same ["suggestions"] cache key), the current user, and any
 * extra users the caller already has (post authors, comment authors,
 * likers, followers/following). The list is suggestions-first so the
 * composer autocomplete shows people to follow before anyone else.
 */
export function useKnownUsers(extra: (KnownUser | null | undefined)[] = []): {
  byUsername: Map<string, KnownUser>;
  list: KnownUser[];
} {
  const { user } = useAuth();
  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: getSuggestions,
    staleTime: 5 * 60 * 1000,
  });

  // The callers build a fresh `extra` array each render — memoize on the
  // ids only, so the map rebuilds when the people change, not every render.
  const extraIds = extra.map((u) => u?._id ?? null).join(",");

  return useMemo(() => {
    const list: KnownUser[] = [];
    const seen = new Set<string>();
    const add = (candidate: KnownUser | null | undefined) => {
      if (!candidate?._id || !candidate.username || seen.has(candidate._id)) return;
      seen.add(candidate._id);
      list.push({
        _id: candidate._id,
        name: candidate.name,
        username: candidate.username,
        photo: candidate.photo ?? null,
      });
    };
    (suggestionsQuery.data?.data ?? []).forEach(add);
    if (user) add(user);
    extra.forEach(add);
    return { byUsername: buildKnownUsersMap(list), list };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionsQuery.data, user, extraIds]);
}
