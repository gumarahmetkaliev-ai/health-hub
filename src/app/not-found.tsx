import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">Вернитесь на обзор Health Hub.</p>
      <Link href="/" className="mt-4 inline-block rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm text-white">
        На главную
      </Link>
    </div>
  );
}
