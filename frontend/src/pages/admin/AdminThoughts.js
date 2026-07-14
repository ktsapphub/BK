import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminThoughts() {
  return (
    <AdminCrudList
      title="Thoughts / Articles"
      description="Thought-leadership articles shown in the Thoughts room and article reader."
      schema={COLLECTION_SCHEMAS.thoughts}
      emptyLabel="article"
      reorderKey="thoughts"
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "is_published", label: "Published", render: (i) => (i.is_published ? "Yes" : "No") },
      ]}
      apiMethods={{
        list: adminApi.listThoughts,
        create: adminApi.createThought,
        update: adminApi.updateThought,
        remove: adminApi.deleteThought,
        reorder: (items) => adminApi.reorder("thoughts", items),
      }}
    />
  );
}
