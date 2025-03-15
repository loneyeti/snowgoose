"use server";

import { renderTypeRepository } from "../db/repositories/render-type.repository";
import { getOutputFormat } from "./output-format.actions";

export async function getRenderTypes() {
  // You can add any business logic or caching here
  return renderTypeRepository.findAll();
}

export async function getRenderType(id: number) {
  return renderTypeRepository.findById(id);
}

export async function getRenderTypeName(outputFormatId: number) {
  const outputFormat = await getOutputFormat(outputFormatId);
  const renderType = await getRenderType(outputFormat?.renderTypeId ?? 0);
  return renderType?.name ?? "";
}
