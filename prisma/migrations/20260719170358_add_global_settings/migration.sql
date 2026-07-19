-- CreateTable
CREATE TABLE "global_settings" (
    "id" SERIAL NOT NULL,
    "default_model_id" INTEGER,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "global_settings" ADD CONSTRAINT "global_settings_default_model_id_fkey" FOREIGN KEY ("default_model_id") REFERENCES "model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
