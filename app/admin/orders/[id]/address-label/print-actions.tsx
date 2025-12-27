'use client';

export function PrintActions() {
  return (
    <div className="flex gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center rounded-lg bg-[#4A7C59] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3D6649]"
      >
        Print
      </button>
      <a
        href="/admin"
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Back to Admin
      </a>
    </div>
  );
}



