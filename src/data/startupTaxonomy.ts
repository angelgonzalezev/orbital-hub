export const STARTUP_STAGES = ['Idea', 'MVP', 'Early-stage', 'Scaling', 'Established'] as const;

export const CATEGORY_GROUPS = [
  {
    label: 'Sectors',
    items: ['DeFi', 'Payments', 'NFT', 'Consumer', 'Gaming', 'DAO', 'DePIN'],
  },
  {
    label: 'Infra & Tech',
    items: ['Infra', 'AI', 'DevTools', 'Security', 'Analytics'],
  },
  {
    label: 'Services',
    items: ['Consulting', 'Development', 'Legal', 'Marketing', 'Auditing', 'Recruiting', 'Design'],
  },
] as const;

export const STARTUP_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.items);

export const TECH_STACK_OPTIONS = [
  'Rust',
  'Anchor',
  'Next.js',
  'React',
  'TypeScript',
  'Solana Pay',
  'SPL Token',
  'Token Extensions',
  'Metaplex',
  'IPFS',
  'Helius',
  'QuickNode',
  'Triton',
  'Jito',
  'Pyth',
  'Switchboard',
  'Supabase',
  'PostgreSQL',
  'Tailwind CSS',
] as const;
