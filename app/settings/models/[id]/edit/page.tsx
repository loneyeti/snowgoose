import { fetchModel } from "@/app/_lib/api";
import EditModelForm from "@/app/_ui/settings/models/edit-model-form";
import { notFound } from "next/navigation";

export default async function EditModel({
  params,
}: {
  params: { id: string };
}) {
  const model = await fetchModel(params.id);
  if (!model) {
    return notFound();
  }
  return <EditModelForm model={model} />;
}
