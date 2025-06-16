import { StyleSheet, TouchableOpacity } from 'react-native';

import OrganizationSwitcher from '@/components/clerxpo/OrganizationSwitcher';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)');
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

      <OrganizationSwitcher />

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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 20,
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
