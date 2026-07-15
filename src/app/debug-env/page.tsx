export default function DebugEnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "NOT SET";
  
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Debug Environment Variables (Vercel)</h1>
      <p><strong>URL:</strong> {url}</p>
      <p>
        <strong>ANON_KEY (First 30 chars):</strong> {key.substring(0, 30)}...
      </p>
      <p>
        <strong>ANON_KEY Length:</strong> {key.length} characters (Should be 226 for Legacy JWT)
      </p>
      <p>
        <strong>Has Spaces/Newlines?</strong> {/\s/.test(key) ? "YES (THIS IS THE BUG!)" : "NO"}
      </p>
    </div>
  );
}
