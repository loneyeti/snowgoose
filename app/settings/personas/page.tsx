import { SettingsHeading } from "@/app/ui/typography"
import { fetchPersonas } from "@/app/lib/api"
import { Persona } from "@/app/lib/model"
import { MaterialSymbol } from "react-material-symbols"
import "react-material-symbols/outlined"

export default async function Personas() {
    const personas = await fetchPersonas()
    return (
        <main>
        <SettingsHeading>Personas</SettingsHeading>
        <div className="flex flex-col justify-center mt-6">
        {
            personas.map(
                (persona: Persona) => {
                    return (
                        <div className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50" key={persona.id}>
                            <h2 className="text-lg font-semibold mb-3">{persona.name}</h2>
                            <p className="text-xs ml-6 text-slate-600">{persona.prompt}</p>
                        </div>
                    )
                }
            )
        }
            <div className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-200 hover:bg-slate-300">
                <div>
                    <p className="text-lg font-semibold">
                        <MaterialSymbol icon="add_circle" size={24} className="mr-2 align-middle"></MaterialSymbol>
                        Add new
                    </p>
                </div>
            </div>
        </div>
        </main>
    )
}