import { getOutputFormat } from "@/app/_lib/server_actions/output-format.actions";
import EditOutputFormatForm from "@/app/_ui/settings/output_formats/edit-output-format-form";
import { notFound } from "next/navigation";

export default async function EditOutputFormat({
  params,
}: {
  params: { id: string };
}) {
  const outputFormat = await getOutputFormat(Number(params.id));
  if (!outputFormat) {
    return notFound();
  }
  return <EditOutputFormatForm outputFormat={outputFormat} />;
}
