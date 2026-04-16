import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Pagination, SearchField, Skeleton } from "@heroui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useRecords } from "@/hooks/use-records";
import RecordCard from "@/components/record-card";
import RecordForm from "@/components/record-form";
import ConfirmDelete from "@/components/confirm-delete";
import type { Record as RecordType } from "@classified/shared";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editRecord, setEditRecord] = useState<RecordType | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<RecordType | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, isLoading } = useRecords({ page, search: debouncedSearch });

  // Debounce search input
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const totalPages = data ? Math.ceil(data.resultsCount / data.limit) : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <SearchField value={search} onChange={handleSearchChange} className="max-w-md flex-1">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search records..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Button variant="primary" onPress={() => setShowCreateForm(true)}>
          <FaPlus />
          Add Record
        </Button>
      </div>

      {/* Stats */}
      {data && (
        <p className="text-sm text-default-500">
          {data.resultsCount} {debouncedSearch ? "results" : "records"} total
        </p>
      )}

      {/* Records Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : data?.records.length === 0 ? (
        <div className="text-center py-12 text-default-500">
          {debouncedSearch
            ? "No records match your search."
            : "No records yet. Add your first one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onEdit={setEditRecord}
              onDelete={setDeleteRecord}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous onPress={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>
                  <FaChevronLeft size={12} />
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <Pagination.Item key={p}>
                    <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                );
              })}
              {totalPages > 7 && page < totalPages - 3 && (
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              )}
              <Pagination.Item>
                <Pagination.Next onPress={() => setPage((p) => Math.min(totalPages, p + 1))} isDisabled={page === totalPages}>
                  <FaChevronRight size={12} />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}

      <RecordForm
        isOpen={showCreateForm || !!editRecord}
        onClose={() => {
          setShowCreateForm(false);
          setEditRecord(null);
        }}
        record={editRecord}
      />
      <ConfirmDelete
        isOpen={!!deleteRecord}
        onClose={() => setDeleteRecord(null)}
        record={deleteRecord}
      />
    </div>
  );
}
