import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapProfileRow } from '@/lib/supabase/mappers';
import { validateProfile } from '@/utils/validation';
import type { User } from '@/interface/user';
import { KEEP_MEDIA, type MediaMutation } from '@/interface/media';
import { mediaService } from '@/services/mediaService';

const cleanupReplacedMedia = async (path?: string | null) => {
  try {
    await mediaService.deleteManagedObject(path);
  } catch (error) {
    console.error('Unable to remove replaced profile media:', error);
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data) : null;
  },

  getUserByWallet: async (walletAddress: string): Promise<User | null> => {
    const { data, error } = await getSupabaseBrowserClient()
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProfileRow(data) : null;
  },

  upsertProfile: async (input: Partial<User>, avatarMutation: MediaMutation = KEEP_MEDIA): Promise<User> => {
    const errors = validateProfile(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Authentication required.');

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();
    if (profileError) throw profileError;

    let uploadedAvatar: string | null = null;
    if (avatarMutation.type === 'replace') {
      uploadedAvatar = await mediaService.uploadProfileAvatar(avatarMutation.blob);
    }

    const nextAvatar =
      avatarMutation.type === 'replace'
        ? uploadedAvatar
        : avatarMutation.type === 'remove'
          ? null
          : currentProfile.avatar;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar: nextAvatar,
        bio: input.bio || null,
        display_name: input.displayName || '',
        job_title: input.jobTitle || '',
        telegram_handle: input.telegramHandle || null,
        twitter_handle: input.twitterHandle || null,
      })
      .eq('auth_user_id', user.id)
      .select('*')
      .single();

    if (error) {
      await cleanupReplacedMedia(uploadedAvatar);
      throw error;
    }

    if (currentProfile.avatar !== nextAvatar) {
      await cleanupReplacedMedia(currentProfile.avatar);
    }

    return mapProfileRow(data);
  },
};
