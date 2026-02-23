export type Notification = {
  id: number;
  user_id: number;
  type: string;
  message: string;
  related_entity_id: number | null;
  is_read: boolean;
  created_at: string;
};
