import { getPublicCertificateData } from "@/features/learning-module/actions/certificate";
import { ShieldCheck, Calendar, Award, User, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const data = await getPublicCertificateData(id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-lg">
        {data ? (
          <div className="bg-white rounded-2xl shadow-xl border p-8 text-center">
            {/* Verified badge */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1">
              Certificate Verified
            </h1>
            <p className="text-muted-foreground mb-6">
              This certificate is authentic and was issued by Remonest.
            </p>

            {/* Details */}
            <div className="text-left space-y-4 bg-muted/40 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Recipient</p>
                  <p className="font-semibold text-foreground">{data.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Module</p>
                  <p className="font-semibold text-foreground">{data.moduleTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                  <p className="font-semibold text-foreground">
                    {new Date(data.completedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate ID</p>
                  <p className="font-mono text-sm text-foreground">{data.certificateId}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1">
              Certificate Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              We could not verify this certificate. The ID may be incorrect, or the certificate does not exist.
            </p>

            {id && (
              <p className="font-mono text-xs text-muted-foreground mb-4 break-all">
                Searched: {id}
              </p>
            )}

            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
