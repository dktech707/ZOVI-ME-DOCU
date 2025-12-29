import { RequestDetail } from '../../../components/RequestDetail';

export default function RequestPage({ params }: { params: { id: string } }) {
  return (
    <main className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <RequestDetail id={params.id} />
    </main>
  );
}
