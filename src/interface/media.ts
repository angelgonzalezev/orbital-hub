export type MediaMutation = { type: 'keep' } | { type: 'replace'; blob: Blob } | { type: 'remove' };

export const KEEP_MEDIA: MediaMutation = { type: 'keep' };
