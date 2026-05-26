export function BrokenMediaIcon() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Broken-image glyph — intentionally dim so it doesn't dominate the feed */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#333" aria-hidden="true">
        <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4V5h15zm0 14H3l4-4.01 4 4 4.01-4 3 3.01V19zM3 3v18h18V3H3z" />
      </svg>
    </div>
  );
}
