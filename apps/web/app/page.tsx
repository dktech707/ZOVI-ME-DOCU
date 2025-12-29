import { CategoryList } from '../components/CategoryList';
import { JobRequestList } from '../components/JobRequestList';

export default function Page() {
  return (
    <main className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h1 className="mb-2 text-xl font-semibold">Find help nearby</h1>
        <p className="text-sm text-zinc-400">
          This is a minimal marketplace skeleton: categories → job requests → offers → bookings.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-3 text-base font-semibold">Categories</h2>
          <CategoryList />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-3 text-base font-semibold">Open requests</h2>
          <JobRequestList />
        </div>
      </section>
    </main>
  );
}
