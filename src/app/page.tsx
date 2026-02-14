export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 pt-12 text-center">
      <h2 className="text-4xl font-bold tracking-tight text-foreground">
        Find the perfect
        <span className="text-accent"> domain name</span>
      </h2>
      <p className="max-w-lg text-lg text-muted">
        Type a word or brand name and we&apos;ll generate clever domain
        suggestions using TLD hacks, prefixes, suffixes, and more.
      </p>
    </div>
  );
}
