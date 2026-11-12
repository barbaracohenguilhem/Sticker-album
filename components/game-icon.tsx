const ICONS = {
  explore: "m12 3 8 8-8 10-8-10 8-8Z M9 11l3-3 3 3-3 4-3-4Z",
  album: "M5 3h14v18H5z M5 7h14 M9 11h6v6H9z",
  notebook: "M6 3h14v18H6z M3 7h6 M3 12h6 M3 17h6 M12 8h4 M12 12h4",
  trade: "M4 8h15l-4-4 M20 16H5l4 4",
  close: "m6 6 12 12 M18 6 6 18",
  target: "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z M12 10v4 M10 12h4",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  arrow: "m9 5 7 7-7 7",
  back: "m15 5-7 7 7 7",
  star: "m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1 3-6Z",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M14 8h-4v4h4v4h-4 M12 6v2 M12 16v2",
  check: "m5 12 4 4L19 6",
  help: "M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 18h.01 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
} as const;

export function GameIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="game-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}
