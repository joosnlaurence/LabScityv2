export interface CollabProfileProps {
  percentMatch: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  openToCollab: boolean;
  about?: string | null;
  last?: boolean;
  closestTopics: string[];
}