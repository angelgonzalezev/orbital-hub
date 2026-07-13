import hero4 from '@public/images/solana-hub/hero4.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const Hero = () => {
  return (
    <section
      className="relative flex min-h-[720px] items-end overflow-hidden bg-black pb-16 pt-[150px] md:min-h-[780px] md:pb-20 md:pt-[180px]"
      id="hero">
      <Image
        src={hero4}
        alt="Solana Startups Hub concept"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-45"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="main-container relative z-10 w-full">
        <div className="max-w-[900px] space-y-8 text-left">
          <RevealAnimation delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#14F195]" />
              MVP · Active development
            </div>
          </RevealAnimation>
          <div className="space-y-5">
            <RevealAnimation delay={0.2}>
              <h1 className="max-w-[860px] text-4xl font-bold leading-tight text-white sm:text-5xl md:text-heading-1">
                Solana Startups Hub
              </h1>
            </RevealAnimation>
            <RevealAnimation delay={0.3}>
              <p className="max-w-[720px] text-lg leading-8 text-white/75 md:text-xl">
                An early-stage directory for founders building on Solana. Create a structured startup profile, signal
                what you are working on, and help make the ecosystem easier to navigate.
              </p>
            </RevealAnimation>
            <RevealAnimation delay={0.35}>
              <p className="text-sm font-medium text-white/50">
                The product is evolving in public. Wallet sign-in is required to access startup listings.
              </p>
            </RevealAnimation>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <RevealAnimation delay={0.4} direction="left" offset={30}>
              <div className="w-full sm:w-auto">
                <LinkButton
                  href="/startups"
                  className="btn btn-primary btn-xl w-full shadow-lg shadow-primary-500/20 hover:btn-white sm:w-auto">
                  Explore marketplace
                </LinkButton>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.5} direction="left" offset={30}>
              <div className="w-full sm:w-auto">
                <LinkButton
                  href="/#roadmap"
                  className="btn btn-white-dark btn-xl w-full border border-white/15 hover:btn-primary sm:w-auto">
                  View roadmap
                </LinkButton>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
