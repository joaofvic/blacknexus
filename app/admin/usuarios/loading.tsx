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
      <TableSkeleton rows={8} cols={4} />
    </div>
  );
}
