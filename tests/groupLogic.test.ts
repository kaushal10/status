import {
    addMemberToGroup,
    canAddMember,
    groupHasMember,
    removeMemberFromGroup,
} from '../libs/groupLogic';

import { Group, User } from '../types';

const group: Group = {
  id: 'group-1',
  name: 'Football',
  memberIds: ['user-1'],
};

const user: User = {
  id: 'user-2',
  name: 'John',
  phone: '9876543210',
  available: true,
};

describe('groupLogic', () => {
  test('detects an existing member', () => {
    expect(
      groupHasMember(
        group,
        'user-1'
      )
    ).toBe(true);

    expect(
      groupHasMember(
        group,
        'user-2'
      )
    ).toBe(false);
  });

  test('allows adding a new member', () => {
    expect(
      canAddMember(
        group,
        user
      )
    ).toBe(true);
  });

  test('does not allow adding an existing member', () => {
    const existingUser: User = {
      ...user,
      id: 'user-1',
    };

    expect(
      canAddMember(
        group,
        existingUser
      )
    ).toBe(false);
  });

  test('adds a member to a group', () => {
    const updatedGroup =
      addMemberToGroup(
        group,
        'user-2'
      );

    expect(
      updatedGroup.memberIds
    ).toEqual([
      'user-1',
      'user-2',
    ]);
  });

  test('does not add the same member twice', () => {
    const updatedGroup =
      addMemberToGroup(
        group,
        'user-1'
      );

    expect(
      updatedGroup.memberIds
    ).toEqual(['user-1']);
  });

  test('removes a member from a group', () => {
    const groupWithTwoMembers: Group = {
      ...group,
      memberIds: [
        'user-1',
        'user-2',
      ],
    };

    const updatedGroup =
      removeMemberFromGroup(
        groupWithTwoMembers,
        'user-2'
      );

    expect(
      updatedGroup.memberIds
    ).toEqual(['user-1']);
  });

  test('removing a non-member changes nothing', () => {
    const updatedGroup =
      removeMemberFromGroup(
        group,
        'user-999'
      );

    expect(
      updatedGroup.memberIds
    ).toEqual(['user-1']);
  });
});