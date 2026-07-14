import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import MediaPickerInput from "./MediaPickerInput";

function setPath(obj, name, value) {
  return { ...obj, [name]: value };
}

export default function DynamicForm({ schema, value, onChange }) {
  const values = value || {};

  const update = (name, v) => onChange(setPath(values, name, v));

  return (
    <div className="space-y-5">
      {schema.map((field) => (
        <FieldRenderer key={field.name} field={field} value={values[field.name]} onChange={(v) => update(field.name, v)} />
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange }) {
  const id = `field-${field.name}`;
  switch (field.type) {
    case "text":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Input id={id} data-testid={`admin-field-${field.name}`} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Textarea id={id} rows={4} data-testid={`admin-field-${field.name}`} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between rounded-md border border-input px-3 py-2.5">
          <Label htmlFor={id} className="mb-0">{field.label}</Label>
          <Switch id={id} data-testid={`admin-field-${field.name}`} checked={!!value} onCheckedChange={onChange} />
        </div>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger data-testid={`admin-field-${field.name}`}><SelectValue placeholder="Select\u2026" /></SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "image":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <MediaPickerInput label={field.name} value={value} onChange={onChange} />
        </div>
      );
    case "array_string":
      return <ArrayStringField field={field} value={value} onChange={onChange} />;
    case "object":
      return <ObjectField field={field} value={value} onChange={onChange} />;
    case "array_object":
      return <ArrayObjectField field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

function ArrayStringField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>{field.label}</Label>
      <div className="space-y-2 mt-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input value={item} onChange={(e) => update(i, e.target.value)} data-testid={`admin-field-${field.name}-${i}`} />
            <button type="button" onClick={() => remove(i)} className="focus-ring shrink-0 rounded-md border border-input px-2 hover:bg-accent">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} data-testid={`admin-add-${field.name}`} className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

function ObjectField({ field, value, onChange }) {
  const obj = value || {};
  const update = (name, v) => onChange({ ...obj, [name]: v });
  return (
    <div className="rounded-md border border-input p-3">
      <Label className="mb-2 block">{field.label}</Label>
      <div className="grid sm:grid-cols-2 gap-3">
        {field.fields.map((sub) => (
          <div key={sub.name}>
            <Label className="text-xs opacity-70">{sub.label || sub.name}</Label>
            <Input value={obj[sub.name] || ""} onChange={(e) => update(sub.name, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrayObjectField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (i, name, v) => {
    const next = [...items];
    next[i] = { ...next[i], [name]: v };
    onChange(next);
  };
  const add = () => onChange([...items, {}]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <Label>{field.label}</Label>
      <div className="space-y-3 mt-1">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-input p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium opacity-60">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="focus-ring rounded p-1 hover:bg-accent"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} className="focus-ring rounded p-1 hover:bg-accent"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => remove(i)} className="focus-ring rounded p-1 hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {field.fields.map((sub) => (
                <div key={sub.name} className={sub.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label className="text-xs opacity-70">{sub.label || sub.name}</Label>
                  {sub.type === "textarea" ? (
                    <Textarea rows={3} value={item[sub.name] || ""} onChange={(e) => updateItem(i, sub.name, e.target.value)} />
                  ) : sub.type === "image" ? (
                    <MediaPickerInput label={`${field.name}-${i}-${sub.name}`} value={item[sub.name]} onChange={(v) => updateItem(i, sub.name, v)} />
                  ) : (
                    <Input value={item[sub.name] || ""} onChange={(e) => updateItem(i, sub.name, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={add} data-testid={`admin-add-${field.name}`} className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add {field.label}
        </button>
      </div>
    </div>
  );
}
