import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import RevealAnimation from '../animation/RevealAnimation';

const steps = [
  {
    number: '01',
    title: 'Connect your wallet',
    meta: 'Takes seconds',
    description:
      'Sign a free message with any Solana wallet. That signature is your account — no email, no password, nothing to remember.',
  },
  {
    number: '02',
    title: 'Build your listing',
    meta: 'About five minutes',
    description:
      'Complete your founder profile, add startup details and a logo, and save everything as a private draft you can keep editing.',
  },
  {
    number: '03',
    title: 'Submit for review',
    meta: 'Human-reviewed',
    description:
      'Send the finished listing for review. Approved projects publish to the protected directory where builders and investors browse.',
  },
];

const Process = () => {
  return (
    <section className="bg-[#050505] py-16 md:py-24" id="process">
      <div className="main-container">
        <div className="text-center space-y-3 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 font-bold text-white md:text-heading-2">From wallet to published listing</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[776px] mx-auto text-lg text-white/70">
              Three steps. No forms marathon, no gatekeepers — just a wallet signature and your startup&apos;s story.
            </p>
          </RevealAnimation>
        </div>
        <RevealAnimation delay={0.4} direction="up">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="h-full space-y-6 rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 text-left transition-colors hover:border-primary-500/20 md:p-8">
                <div className="flex items-center justify-between">
                  <span aria-hidden="true" className="text-3xl font-bold tracking-tight text-white/15">
                    {step.number}
                  </span>
                  <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent/90">
                    {step.meta}
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-heading-5 font-bold text-white">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealAnimation>
        <RevealAnimation delay={0.5}>
          <div className="mt-10 flex justify-center md:mt-12">
            <Link
              href="/dashboard/startups/new"
              className="group inline-flex min-h-11 items-center gap-2 text-base font-semibold text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-md px-2">
              Start step one — it&apos;s free
              <MoveRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default Process;
