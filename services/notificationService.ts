import { Group, User } from '../types';

export function getUniqueNotificationRecipients(
  currentUser: User,
  groups: Group[],
): string[] {
  const recipientIds = new Set<string>();

  for (const group of groups) {
    // Only consider groups that contain the current user
    if (!group.memberIds.includes(currentUser.id)) {
      continue;
    }

    for (const memberId of group.memberIds) {
      // Don't notify yourself
      if (memberId === currentUser.id) {
        continue;
      }

      recipientIds.add(memberId);
    }
  }

  return Array.from(recipientIds);
}