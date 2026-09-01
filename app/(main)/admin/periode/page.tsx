import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPeriodeAktifId } from "@/lib/periode";

/**
 * Alias stabil ke dashboard periode yang sedang aktif.
 *
 * Komponen klien (Sidebar, MobileNav, RoleSwitcher, LoginForm) tidak bisa
 * membaca cookie periode, dan sebelumnya menautkan ke UUID periode seed yang
 * di-hardcode. Sekarang semuanya cukup menaut ke `/admin/periode`, dan rute ini
 * yang mengarahkan ke periode yang benar-benar dipilih.
 */
export default async function RedirectKePeriodeAktif() {
  const token = (await cookies()).get("sigap_token")?.value;
  redirect(`/admin/periode/${await getPeriodeAktifId(token)}`);
}
