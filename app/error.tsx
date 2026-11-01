"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-loading">
      <div>
        <h1>Something went wrong</h1>
        <p>Please try again. Your saved progress stays on this device.</p>
        <button onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
