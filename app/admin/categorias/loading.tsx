import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  TableSkeleton,
} from "@/components/admin/table-skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <ToolbarSkeleton />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
