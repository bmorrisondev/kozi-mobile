import { ActivityIndicator, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth, useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function TabTwoScreen() {
  const { signOut } = useAuth();
  const { organization } = useOrganization();
  const { userMemberships, setActive, createOrganization } = useOrganizationList({ userMemberships: true });
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [newlyCreatedOrg, setNewlyCreatedOrg] = useState<{ id: string, name: string } | null>(null);

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)');
  }
  
  async function handleSelectOrganization(orgId: string | null) {
    if (setActive) {
      await setActive({ organization: orgId });
    }
    setModalVisible(false);
  }
  
  async function handleCreateOrganization() {
    if (!createOrganization || !newOrgName.trim()) return;
    
    setIsCreatingOrg(true);
    try {
      // Create the organization
      const org = await createOrganization({ name: newOrgName.trim() });
      
      // Set it as active if created successfully
      if (org && setActive) {
        await setActive({ organization: org.id });
        setNewOrgName('');
        setModalVisible(false);
        
        // Store the newly created org and show invite modal
        setNewlyCreatedOrg({
          id: org.id,
          name: org.name
        });
        setInviteModalVisible(true);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setIsCreatingOrg(false);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim() || !organization) return;
    
    setIsSendingInvite(true);
    try {
      // Check if the email is valid
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Send invitation using Clerk's API
      await organization.inviteMember({
        emailAddress: inviteEmail.trim(),
        role: 'org:member'
      });
      
      // Clear the input and show success message
      setInviteEmail('');
      alert(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSendingInvite(false);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.organizationContainer}>
        <ThemedText style={styles.subtitleText}>Selected organization</ThemedText>
        <TouchableOpacity 
          style={styles.organizationButton}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText style={styles.organizationText}>
            {organization?.name || 'Personal Account'}
          </ThemedText>
          <IconSymbol size={16} name="chevron.down" color="#424242" />
        </TouchableOpacity>
      </ThemedView>
      
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select Organization</ThemedText>
            <TouchableOpacity 
                key={'personal-acct'}
                style={[styles.orgListItem, !organization && styles.activeOrgItem ]}
                onPress={() => handleSelectOrganization(null)}
              >
                <ThemedText style={styles.orgListItemText}>
                  Personal Account
                </ThemedText>
                {!organization && (
                  <IconSymbol size={16} name="checkmark" color="#424242" />
                )}
              </TouchableOpacity>
            {userMemberships?.data?.map((membership) => (
              <TouchableOpacity 
                key={membership.organization.id}
                style={[styles.orgListItem, 
                  membership.organization.id === organization?.id && styles.activeOrgItem
                ]}
                onPress={() => handleSelectOrganization(membership.organization.id)}
              >
                <ThemedText style={styles.orgListItemText}>
                  {membership.organization.name}
                </ThemedText>
                {membership.organization.id === organization?.id && (
                  <IconSymbol size={16} name="checkmark" color="#424242" />
                )}
              </TouchableOpacity>
            ))}
            
            <View style={styles.divider} />
            
            <ThemedText style={styles.sectionTitle}>Create new organization</ThemedText>
            
            <View style={styles.createOrgContainer}>
              <TextInput
                style={styles.orgNameInput}
                placeholder="Organization name"
                placeholderTextColor="#757575"
                value={newOrgName}
                onChangeText={setNewOrgName}
              />
              <TouchableOpacity 
                style={[styles.createOrgButton, !newOrgName.trim() && styles.disabledButton]}
                onPress={handleCreateOrganization}
                disabled={!newOrgName.trim() || isCreatingOrg}
              >
                {isCreatingOrg ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.createOrgButtonText}>Create</ThemedText>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Invitation Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Invite Members to {newlyCreatedOrg?.name || organization?.name}
            </ThemedText>
            
            <ThemedText style={styles.inviteDescription}>
              Send invitations to collaborate with others in your organization.
            </ThemedText>
            
            <View style={styles.createOrgContainer}>
              <TextInput
                style={styles.orgNameInput}
                placeholder="Email address"
                placeholderTextColor="#757575"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={[styles.createOrgButton, !inviteEmail.trim() && styles.disabledButton]}
                onPress={handleSendInvite}
                disabled={!inviteEmail.trim() || isSendingInvite}
              >
                {isSendingInvite ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.createOrgButtonText}>Send</ThemedText>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setInviteModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#424242',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  organizationContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  organizationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  organizationText: {
    color: '#424242',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#424242',
  },
  orgListItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeOrgItem: {
    backgroundColor: '#F0F0F0',
  },
  orgListItemText: {
    fontSize: 16,
    color: '#424242',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#424242',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  createOrgContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  orgNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#424242',
  },
  createOrgButton: {
    backgroundColor: '#424242',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  createOrgButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  inviteDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
    textAlign: 'center',
  }
});
