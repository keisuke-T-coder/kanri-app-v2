import { redirect } from "next/navigation";

export default function CaseListRedirect() {
  // このページは古い構成のため、メインの一覧ページへリダイレクトさせます
  redirect("/cases");
  return null;
}
