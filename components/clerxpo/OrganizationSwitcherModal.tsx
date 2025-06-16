import { useOrganizationList } from "@clerk/clerk-expo";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
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
            <TouchableOpacity
              key={"personal-acct"}
              style={[
                styles.orgListItem,
                !organization && styles.activeOrgItem,
              ]}
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
                style={[
                  styles.orgListItem,
                  membership.organization.id === organization?.id &&
                    styles.activeOrgItem,
                ]}
                onPress={() =>
                  handleSelectOrganization(membership.organization.id)
                }
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

            <ThemedText style={styles.sectionTitle}>
              Create new organization
            </ThemedText>

            <View style={styles.createOrgContainer}>
              <TextInput
                style={styles.orgNameInput}
                placeholder="Organization name"
                placeholderTextColor="#757575"
                value={newOrgName}
                onChangeText={setNewOrgName}
              />
              <TouchableOpacity
                style={[
                  styles.createOrgButton,
                  !newOrgName.trim() && styles.disabledButton,
                ]}
                onPress={handleCreateOrganization}
                disabled={!newOrgName.trim() || isCreatingOrg}
              >
                {isCreatingOrg ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.createOrgButtonText}>
                    Create
                  </ThemedText>
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
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
