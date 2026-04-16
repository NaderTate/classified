import { useState, useCallback, useRef } from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { SearchField, Button, Skeleton } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecords } from "@/hooks/use-records";
import RecordCard from "@/components/record-card";
import type { Record as RecordType } from "@classified/shared";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editRecord, setEditRecord] = useState<RecordType | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<RecordType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { data, isLoading, refetch, isRefetching } = useRecords({
    page,
    search: debouncedSearch,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleEndReached = useCallback(() => {
    if (data && data.records.length < data.resultsCount) {
      setPage((p) => p + 1);
    }
  }, [data]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SearchField value={search} onChange={handleSearch}>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search records..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </View>
          <Button isIconOnly variant="primary" onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </Button>
        </View>

        {/* Stats */}
        {data && (
          <Text style={{ color: "#71717a", fontSize: 13, marginBottom: 8 }}>
            {data.totalCount} records total
          </Text>
        )}

        {/* List */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 72, borderRadius: 12 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={data?.records || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecordCard record={item} onEdit={setEditRecord} onDelete={setDeleteRecord} />
            )}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#3b82f6" />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 48 }}>
                <Text style={{ color: "#71717a" }}>
                  {debouncedSearch ? "No records match your search." : "No records yet. Tap + to add one!"}
                </Text>
              </View>
            }
          />
        )}

        {/* TODO: RecordForm and ConfirmDelete dialogs — wired in Task 7 */}
      </View>
    </SafeAreaView>
  );
}
