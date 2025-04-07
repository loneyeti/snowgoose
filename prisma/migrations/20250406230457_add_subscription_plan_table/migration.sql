-- CreateTable
CREATE TABLE "subscription_plan" (
    "id" SERIAL NOT NULL,
    "stripe_price_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "usageLimit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_stripe_price_id_key" ON "subscription_plan"("stripe_price_id");
