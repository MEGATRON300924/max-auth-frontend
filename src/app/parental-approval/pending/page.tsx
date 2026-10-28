import Link from "next/link";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

export default function ParentalApprovalPendingPage() {
  return (
    <main className="min-h-screen bg-base px-4 py-10 text-ink sm:px-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col items-center justify-center">
        <img src="/logo.png" alt="MAX Auth" width={52} height={52} className="mb-6 rounded-2xl" />
        <section className="w-full rounded-3xl border border-glass-border bg-base-raised p-7 text-center shadow-sm sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500"><Mail className="h-7 w-7" /></div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Your parent or guardian has been notified</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">We've sent an approval request to the email address you provided. Your MAX Account will remain unavailable until your parent or guardian approves it.</p>
          <div className="mt-6 space-y-3 rounded-2xl border border-glass-border bg-base p-4 text-left">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><p className="text-sm leading-6 text-ink-muted">Ask your parent or guardian to open the email and review the request.</p></div>
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" /><p className="text-sm leading-6 text-ink-muted">You may also need to verify your own email address. Approval and email verification are separate.</p></div>
          </div>
          <Link href="/sign-in" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-600">Return to sign in</Link>
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-ink-faint">MAX doesn't ask you to provide a payment card or upload an identity document for this step.</p>
      </div>
    </main>
  );
}
