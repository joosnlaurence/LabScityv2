'use server'

// TODO: remove the console.logs (MOVE THEM TO CONSOLE.ERRORS PRO)

import { createClient } from '@/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function setNotificationPreference(newValue: boolean, notification_type: string, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: notification_type,
    is_enabled: newValue,
  });

  if (error) {
    console.log("DisableNotification is ERRORING", error);
  }
  console.log("Did not receive error setting preference: ", notification_type)
  return { success: true }
}

export async function setNotificationPreferenceAllLikes(newValue: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: 'post_like',
    is_enabled: newValue
  });

  if (error) {
    console.log("Enabling/Disabling post_likes failed ", error)
  }
  console.log("Did not receive error while setting post_likes")
  return { success: true }
}

export async function setNotificationPreferenceComments(newValue: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: 'new_comment',
    is_enabled: newValue
  });

  if (error) {
    console.log("Enabling/Disabling new_comment failed ", error)
  }
  console.log("Did not receive error while setting new_comment")
  return { success: true }
}

export async function setNotificationPreferenceFollows(newValue: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: 'new_follow',
    is_enabled: newValue
  });

  if (error) {
    console.log("Enabling/Disabling new_follow failed ", error)
  }
  console.log("Did not receive error while setting new_follow")
  return { success: true }
}

export async function setNotificationPreferenceGroupInvites(newValue: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: 'group_invite',
    is_enabled: newValue
  });

  if (error) {
    console.log("Enabling/Disabling group_invite failed ", error)
  }
  console.log("Did not receive error while setting group_invite")
  return { success: true }
}

export async function setNotificationPreferenceMessages(newValue: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: authData.user,
    notification_type: 'new_message',
    is_enabled: newValue
  });

  if (error) {
    console.log("Enabling/Disabling new_message failed ", error)
  }

  console.log("Did not receive error while setting new_message")
  return { success: true }
}


export async function checkIsMuted(itemId: number, itemType: string): Promise<boolean> {
  // Await the server client creation (standard for @supabase/ssr in Next.js)
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('muted_items')
    .select('item_id')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .maybeSingle();

  if (error) {
    console.error('Error checking mute status:', error);
    return false;
  }

  return data !== null;
}

/**
 * Adds a specific item to the user's muted_items table.
 */
export async function muteItem(itemId: number, itemType: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('muted_items')
    .insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
    });

  if (error) {
    console.error(`Failed to mute ${itemType}:`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Removes a specific item from the user's muted_items table.
 */
export async function unmuteItem(itemId: number, itemType: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('muted_items')
    .delete()
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .eq('item_type', itemType);

  if (error) {
    console.error(`Failed to unmute ${itemType}:`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
