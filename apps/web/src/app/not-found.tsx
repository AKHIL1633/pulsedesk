import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
      <p className="text-sm text-slate-500">That ticket doesn&apos;t exist.</p>
      <Link href="/" className="mt-3 inline-block text-sm font-medium text-pulse-600 hover:text-pulse-700">
        Back to tickets
      </Link>
    </div>
  );
}
