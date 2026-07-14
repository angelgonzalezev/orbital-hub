import { CheckCircle2 } from 'lucide-react';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const checklist = ['A Solana wallet', 'About five minutes', 'Your startup’s story'];

const CTA = () => {
  return (
    <section className="border-t border-white/10 bg-black py-16 md:py-24">
      <div className="main-container">
        <RevealAnimation delay={0.1} direction="up" offset={24}>
          <div className="rounded-[32px] bg-gradient-to-br from-primary-500/50 via-white/10 to-accent/40 p-px">
            <div className="rounded-[31px] bg-[#050505] px-6 py-12 sm:px-10 md:px-16 md:py-16">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:items-center lg:gap-16">
                <div className="space-y-6">
                  <h2 className="text-heading-3 font-bold leading-tight text-white md:text-heading-2">
                    Bring your startup into orbit.
                  </h2>
                  <p className="max-w-[560px] text-lg leading-8 text-white/65">
                    Give your project a clear place in the Solana ecosystem — or explore the founders and startups
                    already building there.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <LinkButton
                      href="/dashboard/startups/new"
                      className="btn btn-primary btn-md md:btn-xl hover:btn-white w-full sm:w-auto">
                      List your startup
                    </LinkButton>
                    <LinkButton
                      href="/startups"
                      className="btn btn-white-dark btn-md md:btn-xl hover:btn-primary w-full sm:w-auto">
                      Explore the marketplace
                    </LinkButton>
                  </div>
                  <p className="text-sm text-white/45">
                    Free during early access. Drafts stay private until you submit them for review.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/60 p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    All you need to start
                  </p>
                  <ul className="mt-5 space-y-4">
                    {checklist.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-base text-white/75">
                        <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default CTA;
