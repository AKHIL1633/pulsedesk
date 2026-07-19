import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Ticket } from "@pulsedesk/shared";
import type { RootStackParamList } from "@/navigation/types";
import { ApiError, fetchTickets } from "@/api/client";
import { useSubmittedBy } from "@/hooks/useSubmittedBy";
import { Badge } from "@/components/Badge";
import { CATEGORY_LABELS, CATEGORY_STYLES, STATUS_LABELS, STATUS_STYLES } from "@/lib/badgeStyles";

type Props = NativeStackScreenProps<RootStackParamList, "MyTickets">;

export function MyTicketsScreen({ navigation }: Props) {
  const { submittedBy, isLoaded } = useSubmittedBy();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const all = await fetchTickets();
      setTickets(all);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach PulseDesk.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const myTickets = (tickets ?? []).filter(
    (t) => submittedBy && t.submittedBy.trim().toLowerCase() === submittedBy.trim().toLowerCase(),
  );

  return (
    <View style={styles.flex}>
      {!isLoaded || tickets === null ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !submittedBy ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Submit your first ticket to see it here.
          </Text>
        </View>
      ) : myTickets.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tickets yet.</Text>
        </View>
      ) : (
        <FlatList
          data={myTickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            load();
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("TicketDetail", { ticketId: item.id })}
            >
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.rowBadges}>
                <Badge label={STATUS_LABELS[item.status]} {...STATUS_STYLES[item.status]} />
                {item.category && (
                  <Badge
                    label={CATEGORY_LABELS[item.category]}
                    {...CATEGORY_STYLES[item.category]}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("SubmitTicket")}
      >
        <Text style={styles.fabText}>+ New Ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#b91c1c", fontSize: 14, textAlign: "center" },
  emptyText: { color: "#64748b", fontSize: 14, textAlign: "center" },
  listContent: { padding: 16, paddingBottom: 96, gap: 10 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  rowBadges: { flexDirection: "row", gap: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#0aa8d6",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
