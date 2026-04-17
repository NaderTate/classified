import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, FlatList, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRecords } from "@/hooks/use-records";
import RecordCard from "@/components/record-card";
import RecordForm from "@/components/record-form";
import ConfirmDelete from "@/components/confirm-delete";
import type { Record as RecordType } from "@classified/shared";

const MemoRecordCard = React.memo(RecordCard);

export default function RecordsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editRecord, setEditRecord] = useState<RecordType | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<RecordType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const queryParams = useMemo(
    () => ({ page, search: debouncedSearch, limit: 20 }),
    [page, debouncedSearch],
  );
  const { data, isLoading, refetch, isRefetching } = useRecords(queryParams);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }, []);

  const onEdit = useCallback((r: RecordType) => setEditRecord(r), []);
  const onDelete = useCallback((r: RecordType) => setDeleteRecord(r), []);
  const onOpenCreate = useCallback(() => setShowCreate(true), []);

  const totalPages = data ? Math.ceil(data.resultsCount / (data.limit || 20)) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const renderItem = useCallback(
    ({ item }: { item: RecordType }) => (
      <MemoRecordCard record={item} onEdit={onEdit} onDelete={onDelete} />
    ),
    [onEdit, onDelete],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between pt-2 pb-4">
          <Text className="text-2xl font-bold">Vault</Text>
          <Pressable
            onPress={onOpenCreate}
            className="h-11 w-11 rounded-full bg-primary items-center justify-center active:opacity-80"
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </Pressable>
        </View>

        <Input
          value={search}
          onChangeText={handleSearch}
          placeholder="Search records..."
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Ionicons name="search" size={18} color="#737373" />}
          rightIcon={
            search ? (
              <Pressable onPress={clearSearch} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#737373" />
              </Pressable>
            ) : null
          }
        />

        {data && (
          <Text className="text-muted-foreground text-xs mt-3 mb-2">
            {data.totalCount} {data.totalCount === 1 ? "record" : "records"}
          </Text>
        )}

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={data?.records || []}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor="#3b82f6"
              />
            }
            ListEmptyComponent={
              <View className="items-center pt-20">
                <Ionicons name="key-outline" size={48} color="#525252" />
                <Text className="text-muted-foreground mt-4 text-center">
                  {debouncedSearch ? "No records match your search." : "No records yet."}
                </Text>
                {!debouncedSearch && (
                  <Text className="text-muted-foreground text-sm mt-1">Tap + to add one</Text>
                )}
              </View>
            }
            ListFooterComponent={
              totalPages > 1 ? (
                <View className="flex-row justify-center items-center gap-4 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    label="Previous"
                    disabled={!hasPrevPage}
                    onPress={() => setPage((p) => p - 1)}
                  />
                  <Text className="text-muted-foreground text-sm">
                    {page} / {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    label="Next"
                    disabled={!hasNextPage}
                    onPress={() => setPage((p) => p + 1)}
                  />
                </View>
              ) : null
            }
          />
        )}

        <RecordForm
          isOpen={showCreate || !!editRecord}
          onClose={() => {
            setShowCreate(false);
            setEditRecord(null);
          }}
          record={editRecord}
        />
        <ConfirmDelete
          isOpen={!!deleteRecord}
          onClose={() => setDeleteRecord(null)}
          record={deleteRecord}
        />
      </View>
    </SafeAreaView>
  );
}
