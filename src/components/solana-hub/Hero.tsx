import hero4 from '@public/images/solana-hub/hero4.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const trustSignals = ['Free to list', 'Wallet sign-in, no email', 'Every listing human-reviewed'];

const Hero = () => {
  return (
    <section
      className="relative flex min-h-[720px] items-end overflow-hidden bg-black pb-16 pt-[150px] md:min-h-[780px] md:pb-20 md:pt-[180px]"
      id="hero">
      <Image
        src={hero4}
        alt="Orbital startup discovery"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-45"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />
      <div className="main-container relative z-10 w-full">
        <div className="max-w-[900px] space-y-8 text-left">
          <RevealAnimation delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              Early access — free for founders
            </div>
          </RevealAnimation>
          <div className="space-y-5">
            <RevealAnimation delay={0.2}>
              <h1 className="max-w-[860px] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-heading-1">
                Where Solana startups
                <br className="hidden sm:block" /> get{' '}
                <span className="bg-gradient-to-r from-primary-500 to-accent bg-clip-text text-transparent">
                  discovered
                </span>
                .
              </h1>
            </RevealAnimation>
            <RevealAnimation delay={0.3}>
              <p className="max-w-[640px] text-lg leading-8 text-white/70 md:text-xl md:leading-9">
                Orbital gives your project one structured profile — market signals, team, and founder contact — in a
                directory that investors and builders actually browse.
              </p>
            </RevealAnimation>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <RevealAnimation delay={0.4} direction="left" offset={30}>
              <div className="w-full sm:w-auto">
                <LinkButton
                  href="/dashboard/startups/new"
                  className="btn btn-primary btn-xl w-full shadow-lg shadow-primary-500/20 hover:btn-white sm:w-auto">
                  List your startup
                </LinkButton>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.5} direction="left" offset={30}>
              <div className="w-full sm:w-auto">
                <LinkButton
                  href="/startups"
                  className="btn btn-white-dark btn-xl w-full border border-white/15 hover:btn-primary sm:w-auto">
                  Explore the marketplace
                </LinkButton>
              </div>
            </RevealAnimation>
          </div>
          <RevealAnimation delay={0.6}>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/55">
              {trustSignals.map((signal) => (
                <li key={signal} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent/80" />
                  {signal}
                </li>
              ))}
            </ul>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default Hero;
