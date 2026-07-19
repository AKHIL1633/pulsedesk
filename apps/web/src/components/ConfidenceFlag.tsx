import { LOW_CONFIDENCE_THRESHOLD } from "@pulsedesk/shared";

export function ConfidenceFlag({ confidence }: { confidence: number | null }) {
  if (confidence === null) {
    return <span className="text-xs text-slate-400">No AI score</span>;
  }

  const percent = Math.round(confidence * 100);
  const isLow = confidence < LOW_CONFIDENCE_THRESHOLD;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isLow ? "text-amber-700" : "text-slate-500"
      }`}
    >
      {isLow && (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.516 2.63H3.72c-1.347 0-2.189-1.463-1.516-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {percent}% confidence{isLow && " — needs human review"}
    </span>
  );
}
