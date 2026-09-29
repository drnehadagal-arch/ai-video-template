import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loadAndRefreshGeneration } from "@/lib/generations";
import { VideoStatus } from "./VideoStatus";

type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  if (!(await getCurrentUser())) redirect(`/login?next=/videos/${id}`);
  if (!UUID.test(id)) notFound();
  const generation = await loadAndRefreshGeneration(id);
  if (!generation) notFound();

  return (
    <>
      <h1>Your video</h1>
      <VideoStatus initial={generation} />
    </>
  );
}
