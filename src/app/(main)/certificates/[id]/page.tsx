import { getCertificateData } from "@/features/learning-module/actions/certificate";
import { CertificateClient } from "./certificate-client";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { id } = await params;

  const certificateData = await getCertificateData(id);

  if (!certificateData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-muted-foreground">
            This certificate does not exist or you haven't completed the module yet.
          </p>
        </div>
      </div>
    );
  }

  return <CertificateClient certificateData={certificateData} />;
}
