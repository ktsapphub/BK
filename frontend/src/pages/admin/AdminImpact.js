import { useEffect, useMemo, useState } from "react";
import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminImpact() {
  const [categories, setCategories] = useState(null);
  useEffect(() => {
    adminApi.listImpactCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Category dropdown is the live list (hidden ones included so items can still be filed there).
  const schema = useMemo(
    () => COLLECTION_SCHEMAS.impact_items.map((f) =>
      f.name === "category" ? { ...f, options: (categories || []).map((c) => ({ value: c.key, label: c.label })) } : f),
    [categories],
  );

  return (
    <AdminCrudList
      title="Media & Impact"
      description="Press features, program highlights, and mentions — distinct from testimonials."
      schema={schema}
      emptyLabel="item"
      reorderKey="impact_items"
      columns={[
        { key: "title", label: "Title" },
        { key: "org", label: "Org" },
        { key: "category", label: "Category", render: (i) => categories?.find((c) => c.key === i.category)?.label || i.category || "" },
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
