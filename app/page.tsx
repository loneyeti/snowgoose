import { redirect } from "next/navigation";
import ChatWrapper from "./_ui/chat-wrapper";
import { createClient } from "./_utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <main>
      <ChatWrapper />
    </main>
  );
}
