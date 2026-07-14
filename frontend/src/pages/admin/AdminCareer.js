import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminCareer() {
  return (
    <AdminCrudList
      title="Résumé / Career Entries"
      description="These populate the interactive résumé timeline on the public site."
      schema={COLLECTION_SCHEMAS.career_entries}
      emptyLabel="entry"
      reorderKey="career_entries"
      columns={[
        { key: "title", label: "Title" },
        { key: "org", label: "Organization" },
        { key: "is_current", label: "Current", render: (i) => (i.is_current ? "Yes" : "") },
      ]}
      apiMethods={{
        list: adminApi.listCareerEntries,
        create: adminApi.createCareerEntry,
        update: adminApi.updateCareerEntry,
        remove: adminApi.deleteCareerEntry,
        reorder: (items) => adminApi.reorder("career_entries", items),
      }}
    />
  );
}
