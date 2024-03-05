import { fetchOutputFormat } from "@/app/_lib/api";
import { Persona } from "@/app/_lib/model";
import EditOutputFormatForm from "@/app/_ui/settings/output_formats/edit-output-format-form";
import { notFound } from "next/navigation";

export default async function EditOutputFormat({
  params,
}: {
  params: { id: string };
}) {
  const outputFormat = await fetchOutputFormat(params.id);
  if (!outputFormat) {
    return notFound();
  }
  return <EditOutputFormatForm outputFormat={outputFormat} />;
}
