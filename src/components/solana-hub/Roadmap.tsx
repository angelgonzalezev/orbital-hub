import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import RevealAnimation from '../animation/RevealAnimation';

const milestones = [
  {
    status: 'In progress',
    title: 'Stabilize the MVP',
    description: 'Harden validation, finish the founder submission flow, and remove high-risk responsive issues.',
  },
  {
    status: 'Before launch',
    title: 'Production review operations',
    description: 'Replace development approval helpers with a controlled reviewer workflow and complete wallet QA.',
  },
  {
    status: 'Planned',
    title: 'Regression coverage and learning',
    description: 'Expand critical tests, complete route QA, and add lightweight product event tracking.',
  },
  {
    status: 'Later',
    title: 'Verification and communication layers',
    description: 'Explore real domain and X verification, messaging, notifications, and private collaboration tools.',
  },
];

const Roadmap = () => (
  <section className="border-t border-white/10 bg-[#050505] py-16 md:py-24" id="roadmap">
    <div className="main-container">
      <div className="grid gap-12 lg:grid-cols-[minmax(260px,0.65fr)_minmax(0,1.35fr)] lg:gap-20">
        <div className="space-y-5">
          <RevealAnimation delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#14F195]">Public roadmap</p>
          </RevealAnimation>
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 font-bold text-white md:text-heading-2">What we are building next</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[480px] text-lg leading-8 text-white/60">
              Priorities are shown without artificial launch dates. The detailed task status remains available in the
              project documentation.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.35}>
            <Link
              href="/docs/roadmap/current-roadmap"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#14F195]">
              Open detailed roadmap
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </RevealAnimation>
        </div>

        <RevealAnimation delay={0.3} direction="up">
          <ol className="border-t border-white/10">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.title}
                className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[44px_140px_1fr] sm:gap-6">
                <span className="text-sm font-semibold text-white/30">0{index + 1}</span>
                <span className="w-fit rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/60">
                  {milestone.status}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                  <p className="mt-2 max-w-[620px] leading-7 text-white/55">{milestone.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </RevealAnimation>
      </div>
    </div>
  </section>
);

export default Roadmap;
