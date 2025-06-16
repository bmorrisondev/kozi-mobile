import { useOrganization, useOrganizationList } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OrganizationSwitcherModal from "./OrganizationSwitcherModal";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { IconSymbol } from "../ui/IconSymbol";

function OrganizationSwitcher() {
  const { userMemberships, setActive, createOrganization } =
    useOrganizationList({ userMemberships: true });

  const { organization } = useOrganization();
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [newlyCreatedOrg, setNewlyCreatedOrg] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
        setNewOrgName("");
        setModalVisible(false);

        // Store the newly created org and show invite modal
        setNewlyCreatedOrg({
          id: org.id,
          name: org.name,
        });
        setInviteModalVisible(true);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
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
        alert("Please enter a valid email address");
        return;
      }

      // Send invitation using Clerk's API
      await organization.inviteMember({
        emailAddress: inviteEmail.trim(),
        role: "org:member",
      });

      // Clear the input and show success message
      setInviteEmail("");
      alert(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation. Please try again.");
    } finally {
      setIsSendingInvite(false);
    }
  }

  return (
    <ThemedView style={styles.organizationContainer}>
      <ThemedText style={styles.subtitleText}>Selected organization</ThemedText>
      <TouchableOpacity
        style={styles.organizationButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.leftContent}>
          {organization?.imageUrl ? (
            <View style={styles.orgImageContainer}>
              <Image
                source={{ uri: organization.imageUrl }}
                style={styles.orgImage}
              />
            </View>
          ) : (
            <View style={styles.orgImagePlaceholder}>
              <ThemedText style={styles.orgImagePlaceholderText}>
                {(organization?.name || "P")[0]}
              </ThemedText>
            </View>
          )}
          <ThemedText style={styles.organizationText}>
            {organization?.name || "Personal Account"}
          </ThemedText>
        </View>
        <IconSymbol size={16} name="chevron.down" color="#424242" />
      </TouchableOpacity>

      <OrganizationSwitcherModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        organization={organization}
        userMemberships={userMemberships}
        handleSelectOrganization={handleSelectOrganization}
        handleCreateOrganization={handleCreateOrganization}
        newOrgName={newOrgName}
        setNewOrgName={setNewOrgName}
        isCreatingOrg={isCreatingOrg}
      />

      {/* Invitation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInviteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <ThemedText style={styles.modalTitle}>
                Invite Members to {newlyCreatedOrg?.name || organization?.name}
              </ThemedText>

              <ThemedText style={styles.inviteDescription}>
                Send invitations to collaborate with others in your
                organization.
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
                  style={[
                    styles.createOrgButton,
                    !inviteEmail.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSendInvite}
                  disabled={!inviteEmail.trim() || isSendingInvite}
                >
                  {isSendingInvite ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.createOrgButtonText}>
                      Send
                    </ThemedText>
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
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: "#424242",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  signOutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  organizationContainer: {
    marginTop: 24,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  subtitleText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  organizationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  orgImageContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 4,
  },
  orgImage: {
    width: "100%",
    height: "100%",
  },
  orgImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#424242",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  orgImagePlaceholderText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  organizationText: {
    color: "#424242",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
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
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#424242",
  },
  orgListItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeOrgItem: {
    backgroundColor: "#F0F0F0",
  },
  orgListItemText: {
    fontSize: 16,
    color: "#424242",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  inviteDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
  },
  createOrgContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginBottom: 8,
  },
  orgNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#424242",
  },
  createOrgButton: {
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  createOrgButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OrganizationSwitcher;
