import { getModel } from "@/app/_lib/server_actions/model.actions";
import EditModelForm from "@/app/_ui/settings/models/edit-model-form";
import { notFound } from "next/navigation";

export default async function EditModel({
  params,
}: {
  params: { id: string };
}) {
  const model = await getModel(Number(params.id));
  if (!model) {
    return notFound();
  }
  return <EditModelForm model={model} />;
}
