import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../libs/supabase';
import { Group, User } from '../types';
import { useAuth } from './AuthContext';

import {
  addMemberToGroup,
  findUserByPhone,
  removeMemberFromGroup,
} from '../libs/groupLogic';

type GroupContextType = {
  users: User[];
  groups: Group[];
  currentUser: User | undefined;

  loading: boolean;

  addGroup: (
    name: string
  ) => Promise<string | null>;

  addMember: (
    groupId: string,
    phone: string
  ) => Promise<boolean>;

  removeMember: (
    groupId: string,
    memberId: string
  ) => Promise<void>;

  getUserById: (
    userId: string
  ) => User | undefined;

  updateUserStatus: (
    userId: string,
    available: boolean
  ) => Promise<void>;
};

const GroupContext =
  createContext<GroupContextType | null>(
    null
  );

export function GroupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentUser: authUser,
  } = useAuth();

  const [users, setUsers] =
    useState<User[]>([]);

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    if (!authUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [
      usersResult,
      groupsResult,
      membersResult,
    ] = await Promise.all([
      supabase
        .from('users')
        .select('*'),

      supabase
        .from('groups')
        .select('*'),

      supabase
        .from('group_members')
        .select('*'),
    ]);

    if (usersResult.error) {
      console.error(
        'Users error:',
        usersResult.error
      );
    }

    if (groupsResult.error) {
      console.error(
        'Groups error:',
        groupsResult.error
      );
    }

    if (membersResult.error) {
      console.error(
        'Members error:',
        membersResult.error
      );
    }

    const loadedUsers =
      usersResult.data ?? [];

    const loadedGroups =
      groupsResult.data ?? [];

    const loadedMembers =
      membersResult.data ?? [];

    const mappedGroups: Group[] =
      loadedGroups.map((group) => ({
        id: group.id,
        name: group.name,
        memberIds: loadedMembers
          .filter(
            (member) =>
              member.group_id ===
              group.id
          )
          .map(
            (member) =>
              member.user_id
          ),
      }));

    setUsers(loadedUsers);
    setGroups(mappedGroups);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [authUser]);

  const currentUser =
    users.find(
      (user) =>
        user.id === authUser?.id
    );

  const addGroup = async (
    name: string
  ): Promise<string | null> => {
    if (!authUser) {
      return null;
    }

    const { data, error } =
      await supabase
        .from('groups')
        .insert({
          name,
          created_by: authUser.id,
        })
        .select()
        .single();

    if (error) {
      console.error(
        'Create group error:',
        error
      );
      return null;
    }

    const {
      error: memberError,
    } = await supabase
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: authUser.id,
      });

    if (memberError) {
      console.error(
        'Add creator to group error:',
        memberError
      );
      return null;
    }

    setGroups((currentGroups) => [
      ...currentGroups,
      {
        id: data.id,
        name: data.name,
        memberIds: [
          authUser.id,
        ],
      },
    ]);

    return data.id;
  };

  const addMember = async (
    groupId: string,
    phone: string
  ): Promise<boolean> => {
    const user =
      findUserByPhone(
        users,
        phone
      );

    if (!user) {
      return false;
    }

    const group =
      groups.find(
        (item) =>
          item.id === groupId
      );

    if (!group) {
      return false;
    }

    if (
      group.memberIds.includes(
        user.id
      )
    ) {
      return false;
    }

    const { error } =
      await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

    if (error) {
      console.error(
        'Add member error:',
        error
      );
      return false;
    }

    setGroups(
      (currentGroups) =>
        currentGroups.map(
          (group) => {
            if (
              group.id !==
              groupId
            ) {
              return group;
            }

            return addMemberToGroup(
              group,
              user.id
            );
          }
        )
    );

    return true;
  };

  const removeMember =
    async (
      groupId: string,
      memberId: string
    ) => {
      const { error } =
        await supabase
          .from('group_members')
          .delete()
          .eq(
            'group_id',
            groupId
          )
          .eq(
            'user_id',
            memberId
          );

      if (error) {
        console.error(
          'Remove member error:',
          error
        );
        return;
      }

      setGroups(
        (currentGroups) =>
          currentGroups.map(
            (group) => {
              if (
                group.id !==
                groupId
              ) {
                return group;
              }

              return removeMemberFromGroup(
                group,
                memberId
              );
            }
          )
      );
    };

  const getUserById = (
    userId: string
  ) => {
    return users.find(
      (user) =>
        user.id === userId
    );
  };

  const updateUserStatus =
    async (
      userId: string,
      available: boolean
    ) => {
      const { error } =
        await supabase
          .from('users')
          .update({
            available,
          })
          .eq(
            'id',
            userId
          );

      if (error) {
        console.error(
          'Status update error:',
          error
        );
        return;
      }

      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) => {
              if (
                user.id !==
                userId
              ) {
                return user;
              }

              return {
                ...user,
                available,
              };
            }
          )
      );
    };

  return (
    <GroupContext.Provider
      value={{
        users,
        groups,
        currentUser,
        loading,
        addGroup,
        addMember,
        removeMember,
        getUserById,
        updateUserStatus,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context =
    useContext(GroupContext);

  if (!context) {
    throw new Error(
      'useGroups must be used inside GroupProvider'
    );
  }

  return context;
}