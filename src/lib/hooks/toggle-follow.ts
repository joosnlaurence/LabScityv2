import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFollowAction } from '@/lib/actions/profile';
import { profileKeys } from '@/lib/query-keys';

export function useToggleFollow(targetUserId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await toggleFollowAction({ targetUserId });
      if(!res.success) {
        throw new Error(res.error ?? 'Failed to update follow state');
      }
      return res;
    },
    onSuccess: (data) => {
      if(data.data?.isFollowing === false && currentUserId) {
        queryClient.setQueryData(
          profileKeys.followers(targetUserId),
          (old: Array<{ userId: string }> | undefined) => 
            old ? old.filter((f) => f.userId !== currentUserId) : old
        );
      }
    },
    onError: (err) => {

    }
  });
}