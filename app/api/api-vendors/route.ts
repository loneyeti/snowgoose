import { NextRequest, NextResponse } from "next/server";
import { apiVendorRepository } from "@/app/_lib/db/repositories/api-vendor.repository";
import { withErrorHandler, RouteHandlerContext } from "@/app/api/middleware";

// GET /api/api-vendors - List all API vendors
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const apiVendors = await apiVendorRepository.findAll();
    return NextResponse.json(apiVendors);
  }
);
