"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center">
      <p className="text-sm text-red-700">Something went wrong: {error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-3 rounded-md bg-pulse-gradient px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
