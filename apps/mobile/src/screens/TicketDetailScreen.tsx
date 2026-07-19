import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Ticket } from "@pulsedesk/shared";
import type { RootStackParamList } from "@/navigation/types";
import { ApiError, fetchTicket } from "@/api/client";
import { Badge } from "@/components/Badge";
import { CATEGORY_LABELS, CATEGORY_STYLES, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES } from "@/lib/badgeStyles";

type Props = NativeStackScreenProps<RootStackParamList, "TicketDetail">;

export function TicketDetailScreen({ route }: Props) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicket(ticketId)
      .then(setTicket)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this ticket."),
      );
  }, [ticketId]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{ticket.title}</Text>
      <Text style={styles.meta}>
        Submitted {new Date(ticket.createdAt).toLocaleString()}
      </Text>

      <View style={styles.badgeRow}>
        <Badge label={STATUS_LABELS[ticket.status]} {...STATUS_STYLES[ticket.status]} />
        {ticket.category && (
          <Badge label={CATEGORY_LABELS[ticket.category]} {...CATEGORY_STYLES[ticket.category]} />
        )}
        {ticket.priority && <Badge label={ticket.priority} {...PRIORITY_STYLES[ticket.priority]} />}
      </View>

      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>{ticket.description}</Text>

      {ticket.imageUrl && (
        <Image source={{ uri: ticket.imageUrl }} style={styles.image} resizeMode="contain" />
      )}

      {!ticket.category && (
        <Text style={styles.pendingNote}>
          Still being triaged — check back shortly for a category and priority.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#b91c1c", fontSize: 14, textAlign: "center" },
  container: { padding: 20 },
  title: { fontSize: 19, fontWeight: "700", color: "#0f172a" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 4 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 6,
  },
  description: { fontSize: 14, color: "#334155", lineHeight: 20 },
  image: { width: "100%", height: 220, borderRadius: 10, marginTop: 16, backgroundColor: "#f1f5f9" },
  pendingNote: { fontSize: 13, color: "#94a3b8", marginTop: 20, fontStyle: "italic" },
});
