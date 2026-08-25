export function SetupRequired() {
  return (
    <div className="max-w-lg mx-auto px-8 py-16">
      <h1 className="font-display text-xl font-semibold text-text-primary mb-3">Setup required</h1>
      <div className="text-sm text-text-muted space-y-4">
        <p>This app reads live data from Supabase. Your local credentials are not configured yet.</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Open{" "}
            <a
              href="https://supabase.com/dashboard/project/vcwtiprmlwktppnhckxr/settings/api"
              className="text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Supabase API settings
            </a>
          </li>
          <li>
            Copy the <strong className="text-text-primary font-medium">anon public</strong> key into{" "}
            <code className="text-text-primary">.env.local</code> as{" "}
            <code className="text-text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
          <li>
            Restart the dev server (<code className="text-text-primary">npm run dev</code>)
          </li>
        </ol>
      </div>
    </div>
  );
}
