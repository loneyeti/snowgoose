import { getModels } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";
import { DeleteModelButton, EditModelButton } from "../buttons";

export default async function ModelList() {
  const models = await getModels();

  return (
    <>
      {models.map((model: Model) => {
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={model.id}
          >
            <h2 className="text-lg font-semibold mb-3">{model.name}</h2>
            <p className="text-xs ml-6 text-slate-600">{model.apiName}</p>
            <DeleteModelButton id={`${model.id}`} />
            <EditModelButton id={`${model.id}`} />
          </div>
        );
      })}
    </>
  );
}
