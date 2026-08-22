import { Group, User } from '../types';

export function normalizePhone(
  phone: string
): string {
  return phone.replace(/\D/g, '');
}

export function findUserByPhone(
  users: User[],
  phone: string
): User | undefined {
  const normalizedPhone =
    normalizePhone(phone);

  return users.find(
    (user) =>
      normalizePhone(user.phone) ===
      normalizedPhone
  );
}

export function groupHasMember(
  group: Group,
  userId: string
): boolean {
  return group.memberIds.includes(userId);
}

export function canAddMember(
  group: Group,
  user: User
): boolean {
  return !groupHasMember(group, user.id);
}

export function addMemberToGroup(
  group: Group,
  userId: string
): Group {
  if (groupHasMember(group, userId)) {
    return group;
  }

  return {
    ...group,
    memberIds: [
      ...group.memberIds,
      userId,
    ],
  };
}

export function removeMemberFromGroup(
  group: Group,
  userId: string
): Group {
  return {
    ...group,
    memberIds:
      group.memberIds.filter(
        (id) => id !== userId
      ),
  };
}