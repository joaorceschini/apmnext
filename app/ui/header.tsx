import Link from "next/link";

export default async function Header() {
  return (
    <div className="flex gap-4 max-w-full px-4 py-2 border-b border-dashed border-neutral-800 overflow-hidden items-center flex-row justify-between">
      <Link href="/" className="font-bold uppercase">
        apm test
      </Link>
      <Link
        href="https://github.com/joaorceschini/apmnext"
        target="_blank"
        className="hover:underline opacity-50 text-xs"
      >
        by jces
      </Link>
    </div>
  );
}
