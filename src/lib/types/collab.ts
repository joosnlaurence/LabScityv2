export interface GetCollaboratorsResult {
  profile_user_id: string;
  cosine_similarity: number;
  first_name: string;
  last_name: string;
  profile_pic_path: string | null;
}