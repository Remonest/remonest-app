import { getUserCertificates } from "@/features/learning-module/actions/certificate";
import { CertificatesClient } from "./certificates-client";

export default async function CertificatesPage() {
  const certificates = await getUserCertificates();

  return <CertificatesClient certificates={certificates} />;
}
