import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";
import { Badge } from "@/components/ui/badge";

export default function AdminTestimonials() {
  return (
    <AdminCrudList
      title="Testimonials"
      description="Only testimonials marked Verified AND Published render on the public site."
      schema={COLLECTION_SCHEMAS.testimonials}
      emptyLabel="testimonial"
      reorderKey="testimonials"
      columns={[
        { key: "name", label: "Name" },
        { key: "org", label: "Org" },
        { key: "verified", label: "Verified", render: (i) => (i.verified ? <Badge>Verified</Badge> : <Badge variant="outline">Unverified</Badge>) },
        { key: "status", label: "Status" },
      ]}
      apiMethods={{
        list: adminApi.listTestimonials,
        create: adminApi.createTestimonial,
        update: adminApi.updateTestimonial,
        remove: adminApi.deleteTestimonial,
        reorder: (items) => adminApi.reorder("testimonials", items),
      }}
    />
  );
}
