"use server";

import { apiVendorRepository } from "../db/repositories/api-vendor.repository";

export async function getApiVendors() {
  // You can add any business logic or caching here
  return apiVendorRepository.findAll();
}

export async function getApiVendor(id: number) {
  return apiVendorRepository.findById(id);
}
