import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./quran-font.css";

const nativeFetch = window.fetch.bind(window);
const QURAN_CDN = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters";
const QURAN_CACHE = "afaq-quran-uthmani-v1";

function chapterNumber(input: RequestInfo | URL): number | null {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const match = url.match(/(?:^|\/)quran\/(\d+)\.json(?:$|[?#])/);
  if (!match) return null;

  const id = Number(match[1]);
  return Number.isInteger(id) && id >= 1 && id <= 114 ? id : null;
}

function validChapter(data: unknown, id: number): boolean {
  if (!data || typeof data !== "object") return false;

  const chapter = data as {
    id?: number;
    total_verses?: number;
    verses?: Array<{ id?: number; text?: string }>;
  };

  return (
    chapter.id === id &&
    typeof chapter.total_verses === "number" &&
    Array.isArray(chapter.verses) &&
    chapter.verses.length === chapter.total_verses &&
    chapter.verses.every(
      (verse) =>
        typeof verse.id === "number" &&
        typeof verse.text === "string" &&
        verse.text.length > 0 &&
        !verse.text.includes("\uFFFD"),
    )
  );
}

async function fetchVerifiedChapter(id: number): Promise<Response> {
  const remoteUrl = `${QURAN_CDN}/${id}.json`;

  try {
    const response = await nativeFetch(remoteUrl, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Quran CDN returned ${response.status}`);

    const data = await response.clone().json();
    if (!validChapter(data, id)) throw new Error("Invalid Quran chapter data");

    if ("caches" in window) {
      const cache = await caches.open(QURAN_CACHE);
      await cache.put(remoteUrl, response.clone());
    }

    return response;
  } catch (error) {
    if ("caches" in window) {
      const cached = await caches.match(remoteUrl);
      if (cached) return cached;
    }

    throw error;
  }
}

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const id = chapterNumber(input);
  if (id === null) return nativeFetch(input, init);

  try {
    return await fetchVerifiedChapter(id);
  } catch {
    return nativeFetch(input, init);
  }
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
