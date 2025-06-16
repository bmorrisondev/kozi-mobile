import { useOrganizationList } from "@clerk/clerk-expo";
import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ThemedText } from "../ThemedText";
import { IconSymbol } from "../ui/IconSymbol";

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  organization: any;
  userMemberships: ReturnType<typeof useOrganizationList>["userMemberships"];
  handleSelectOrganization: (orgId: string | null) => Promise<void>;
  handleCreateOrganization: () => Promise<void>;
  newOrgName: string;
  setNewOrgName: (name: string) => void;
  isCreatingOrg: boolean;
}

function OrganizationSwitcherModal({
  modalVisible,
  setModalVisible,
  organization,
  userMemberships,
  handleSelectOrganization,
  handleCreateOrganization,
  newOrgName,
  setNewOrgName,
  isCreatingOrg,
}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      presentationStyle="formSheet"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>
              Select Organization
            </ThemedText>
            {/* Active Organization at the top */}
            {organization ? (
              <View style={styles.activeOrgSection}>
                <TouchableOpacity
                  key={organization.id}
                  style={[styles.orgListItem, styles.activeOrgItem]}
                  disabled={true}
                >
                  <View style={styles.orgItemLeftContent}>
                    {organization.imageUrl ? (
                      <View style={styles.orgImageContainer}>
                        <Image
                          source={{ uri: organization.imageUrl }}
                          style={styles.orgImage}
                        />
                      </View>
                    ) : (
                      <View style={styles.orgImagePlaceholder}>
                        <ThemedText style={styles.orgImagePlaceholderText}>
                          {organization.name?.[0] || "P"}
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText style={styles.orgListItemText}>
                      {organization.name || "Personal Account"}
                    </ThemedText>
                  </View>
                  <View style={styles.orgItemRightContent}>
                    <IconSymbol size={16} name="checkmark" color="#424242" />
                    <TouchableOpacity style={styles.settingsButton}>
                      <IconSymbol size={16} name="gear" color="#424242" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                <View style={styles.divider} />
              </View>
            ) : (
              <View style={styles.activeOrgSection}>
                <TouchableOpacity
                  key={"personal-acct-active"}
                  style={[styles.orgListItem, styles.activeOrgItem]}
                  disabled={true}
                >
                  <View style={styles.orgItemLeftContent}>
                    <View style={styles.orgImagePlaceholder}>
                      <ThemedText style={styles.orgImagePlaceholderText}>P</ThemedText>
                    </View>
                    <ThemedText style={styles.orgListItemText}>
                      Personal Account
                    </ThemedText>
                  </View>
                  <View style={styles.orgItemRightContent}>
                    <IconSymbol size={16} name="checkmark" color="#424242" />
                    <TouchableOpacity style={styles.settingsButton}>
                      <IconSymbol size={16} name="gear" color="#424242" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                <View style={styles.divider} />
              </View>
            )}
            
            <ThemedText style={styles.sectionTitle}>
              All Organizations
            </ThemedText>
            
            {/* Personal Account option */}
            {organization && (
              <TouchableOpacity
                key={"personal-acct"}
                style={[styles.orgListItem]}
                onPress={() => handleSelectOrganization(null)}
              >
                <View style={styles.orgItemLeftContent}>
                  <View style={styles.orgImagePlaceholder}>
                    <ThemedText style={styles.orgImagePlaceholderText}>P</ThemedText>
                  </View>
                  <ThemedText style={styles.orgListItemText}>
                    Personal Account
                  </ThemedText>
                </View>
                <View style={styles.orgItemRightContent}>
                </View>
              </TouchableOpacity>
            )}
            
            {/* Organization list */}
            {userMemberships?.data?.map((membership) => {
              // Skip the active organization as it's already at the top
              if (membership.organization.id === organization?.id) return null;
              
              return (
                <TouchableOpacity
                  key={membership.organization.id}
                  style={[styles.orgListItem]}
                  onPress={() =>
                    handleSelectOrganization(membership.organization.id)
                  }
                >
                  <View style={styles.orgItemLeftContent}>
                    {membership.organization.imageUrl ? (
                      <View style={styles.orgImageContainer}>
                        <Image
                          source={{ uri: membership.organization.imageUrl }}
                          style={styles.orgImage}
                        />
                      </View>
                    ) : (
                      <View style={styles.orgImagePlaceholder}>
                        <ThemedText style={styles.orgImagePlaceholderText}>
                          {membership.organization.name[0]}
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText style={styles.orgListItemText}>
                      {membership.organization.name}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}


            <TouchableOpacity
                key={"create-org"}
                style={[styles.orgListItem]}
                onPress={() => {}}
              >
                <View style={styles.orgItemLeftContent}>
                  <View style={styles.orgImagePlaceholder}>
                    <ThemedText style={styles.orgImagePlaceholderText}>+</ThemedText>
                  </View>
                  <ThemedText style={styles.orgListItemText}>
                    Create Organization
                  </ThemedText>
                </View>
              </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  orgImageContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 8,
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
    marginRight: 8,
  },
  orgImagePlaceholderText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  orgItemLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  orgItemRightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsButton: {
    padding: 4,
  },
  activeOrgSection: {
    width: "100%",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
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
    alignSelf: "flex-start",
    marginBottom: 12,
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
});

export default OrganizationSwitcherModal;
