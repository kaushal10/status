import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import MemberCard from '../../components/MemberCard';
import {
  useGroups,
} from '../../context/GroupContext';
import {
  InviteService,
} from '../../services/invites/InviteService';

export default function GroupScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    groups,
    getUserById,
    removeMember,
  } = useGroups();

  const group = groups.find(
    (item) => item.id === id
  );

  if (!group) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Text
          style={styles.errorText}
        >
          Group not found
        </Text>
      </SafeAreaView>
    );
  }

  const members =
    group.memberIds
      .map((memberId) =>
        getUserById(memberId)
      )
      .filter(Boolean);

  const handleInvite = async () => {
    try {
      const invite =
        await InviteService.createInvite(
          group.id
        );

      const inviteUrl =
        `statusapp://invite/${invite.token}`;

      await Share.share({
        message:
          `Join my group "${group.name}":\n${inviteUrl}`,
      });
    } catch (error) {
      console.error(
        'Create invite error:',
        error
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Back
          </Text>
        </Pressable>

        <Text
          style={styles.groupTitle}
        >
          {group.name}
        </Text>

        <Pressable
          style={
            styles.inviteButton
          }
          onPress={
            handleInvite
          }
        >
          <Text
            style={
              styles.inviteButtonText
            }
          >
            Invite / Share
          </Text>
        </Pressable>

        <Text
          style={
            styles.memberHeading
          }
        >
          Members
        </Text>

        {members.map((member) => {
          if (!member) {
            return null;
          }

          return (
            <MemberCard
              key={member.id}
              member={member}
              onRemove={() =>
                removeMember(
                  group.id,
                  member.id
                )
              }
            />
          );
        })}

        <Pressable
          style={
            styles.addMemberButton
          }
          onPress={() =>
            router.push(
              `/group/${group.id}/add-member`
            )
          }
        >
          <Text
            style={
              styles.addMemberText
            }
          >
            + Add member
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#1C1B1F',
    },

    content: {
      padding: 24,
      paddingTop: 40,
    },

    backButton: {
      marginBottom: 24,
    },

    backText: {
      color: '#A5D6A7',
      fontSize: 17,
      fontWeight: '600',
    },

    groupTitle: {
      color: '#F5F5F5',
      fontSize: 30,
      fontWeight: '700',
    },

    inviteButton: {
      height: 54,
      borderRadius: 18,
      backgroundColor:
        '#4CAF50',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 22,
    },

    inviteButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },

    memberHeading: {
      color: '#AAA7AE',
      fontSize: 15,
      marginTop: 35,
      marginBottom: 12,
    },

    addMemberButton: {
      marginTop: 20,
      height: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        '#4A484D',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    addMemberText: {
      color: '#A5D6A7',
      fontSize: 15,
      fontWeight: '600',
    },

    errorText: {
      color: '#F5F5F5',
      fontSize: 18,
      padding: 24,
    },
  });