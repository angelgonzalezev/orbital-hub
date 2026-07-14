import { ContactRound, FilePenLine, ListFilter, WalletCards } from 'lucide-react';
import RevealAnimation from '../animation/RevealAnimation';

const features = [
  {
    icon: FilePenLine,
    title: 'Founder-managed profiles',
    description:
      'Your profile, your listing, your edits. Manage drafts, logos, and updates from one dashboard — and publish only when you decide the listing is ready.',
    span: 'md:col-span-2',
  },
  {
    icon: WalletCards,
    title: 'Wallet-based access',
    description:
      'Sign in with any Solana wallet through SIWS. Startup data stays behind authenticated routes — no scrapers, no anonymous browsing.',
    span: '',
  },
  {
    icon: ListFilter,
    title: 'Structured discovery',
    description:
      'People browse by category, stage, tech stack, fundraising status, and acquisition interest — so the right ones find you.',
    span: '',
  },
  {
    icon: ContactRound,
    title: 'Direct founder contact',
    description:
      'Interested builders and investors reach you through the X or Telegram links you choose to share — no middleman, no inbox you don’t control.',
    span: 'md:col-span-2',
  },
];

const Features = () => (
  <section className="bg-black py-16 md:py-24" id="features">
    <div className="main-container">
      <div className="mb-10 max-w-[760px] space-y-4 md:mb-14">
        <RevealAnimation delay={0.1}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Available now</p>
        </RevealAnimation>
        <RevealAnimation delay={0.2}>
          <h2 className="text-heading-3 font-bold text-white md:text-heading-2">Everything a serious listing needs</h2>
        </RevealAnimation>
        <RevealAnimation delay={0.3}>
          <p className="text-lg leading-8 text-white/65">
            A founder profile, a managed listing, discovery filters, and direct contact — live today, in one focused
            product.
          </p>
        </RevealAnimation>
      </div>

      <RevealAnimation delay={0.35} direction="up">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description, span }) => (
            <article
              key={title}
              className={`rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 transition-colors hover:border-primary-500/30 md:p-8 ${span}`}>
              <div className="flex size-11 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10">
                <Icon aria-hidden="true" className="size-5 text-primary-400" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 max-w-[560px] leading-7 text-white/60">{description}</p>
            </article>
          ))}
        </div>
      </RevealAnimation>
    </div>
  </section>
);

export default Features;
