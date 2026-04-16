import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Input, Pagination, Skeleton } from "@heroui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
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

  const buildPages = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 max-w-md flex-1">
          <FaSearch className="text-default-400 shrink-0" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          {search && (
            <Button size="sm" variant="ghost" onPress={() => handleSearchChange("")}>
              ✕
            </Button>
          )}
        </div>
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
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : data?.records.length === 0 ? (
        <div className="text-center py-12 text-default-500">
          {debouncedSearch
            ? "No records match your search."
            : "No records yet. Add your first one!"}
        </div>
      ) : (
        <div className="grid gap-3">
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
                <Pagination.Previous
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={page === 1}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {buildPages().map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={page === totalPages}
                >
                  <Pagination.NextIcon />
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
