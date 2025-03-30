-- AlterTable
ALTER TABLE "public"."model" ADD COLUMN "input_token_cost" DOUBLE PRECISION,
                   ADD COLUMN "output_token_cost" DOUBLE PRECISION;
