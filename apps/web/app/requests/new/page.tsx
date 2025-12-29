import { CreateRequestForm } from '../../../components/CreateRequestForm';

export default function NewRequest() {
  return (
    <main className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h1 className="text-lg font-semibold">Create a job request</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Auth is stubbed. This form sends `x-user-id` as a demo customer.
      </p>
      <div className="mt-4">
        <CreateRequestForm />
      </div>
    </main>
  );
}
