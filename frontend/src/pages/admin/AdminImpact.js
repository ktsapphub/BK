import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminImpact() {
  return (
    <AdminCrudList
      title="Media & Impact"
      description="Press features, program highlights, and mentions — distinct from testimonials."
      schema={COLLECTION_SCHEMAS.impact_items}
      emptyLabel="item"
      reorderKey="impact_items"
      columns={[
        { key: "title", label: "Title" },
        { key: "org", label: "Org" },
        { key: "is_published", label: "Published", render: (i) => (i.is_published ? "Yes" : "No") },
      ]}
      apiMethods={{
        list: adminApi.listImpactItems,
        create: adminApi.createImpactItem,
        update: adminApi.updateImpactItem,
        remove: adminApi.deleteImpactItem,
        reorder: (items) => adminApi.reorder("impact_items", items),
      }}
    />
  );
}
