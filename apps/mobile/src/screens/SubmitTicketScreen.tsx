import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CreateTicketSchema } from "@pulsedesk/shared";
import type { RootStackParamList } from "@/navigation/types";
import { createTicket, ApiError } from "@/api/client";
import { useSubmittedBy } from "@/hooks/useSubmittedBy";

type Props = NativeStackScreenProps<RootStackParamList, "SubmitTicket">;

export function SubmitTicketScreen({ navigation }: Props) {
  const { submittedBy: savedSubmittedBy, setSubmittedBy } = useSubmittedBy();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submittedBy, setSubmittedByInput] = useState(savedSubmittedBy ?? "");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "PulseDesk needs this permission to attach a photo.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    setError(null);

    const parsed = CreateTicketSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      submittedBy: submittedBy.trim(),
      imageUrl: imageUri ?? undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicket(parsed.data);
      setSubmittedBy(parsed.data.submittedBy);
      setTitle("");
      setDescription("");
      setImageUri(null);
      Alert.alert("Ticket submitted", "Our team (and our AI triage agent) will take a look.");
      navigation.navigate("MyTickets");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Short summary of the issue"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="What happened? What did you expect instead?"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Your name or email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={submittedBy}
          onChangeText={setSubmittedByInput}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Photo (optional)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => setImageUri(null)}>
              <Text style={styles.removePhoto}>Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoButton} onPress={() => pickImage("camera")}>
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={() => pickImage("library")}>
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  photoRow: { flexDirection: "row", gap: 10 },
  photoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  photoButtonText: { fontSize: 13, fontWeight: "600", color: "#0aa8d6" },
  imagePreviewWrap: { gap: 8 },
  imagePreview: { width: "100%", height: 180, borderRadius: 8, backgroundColor: "#f1f5f9" },
  removePhoto: { color: "#b91c1c", fontSize: 13, fontWeight: "600" },
  error: { color: "#b91c1c", marginTop: 14, fontSize: 13 },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#0aa8d6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
