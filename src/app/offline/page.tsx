export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="mt-3 text-sm text-slate-300">
          OpenGym is temporarily unavailable. Reconnect to continue syncing your
          workouts.
        </p>
      </section>
    </main>
  );
}
