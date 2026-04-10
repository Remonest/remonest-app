"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobTypeBadge } from "./index";
import { approveJob, rejectJob, getPendingJobs } from "@/lib/jobs/actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { JobType } from "@/lib/jobs/utils";

interface PendingJob {
  id: string;
  title: string;
  company: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string;
  deadline: string | null;
  created_at: string;
  status: string;
}

export function AdminApprovalTable() {
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    jobId: string;
    job?: PendingJob;
  }>({
    open: false,
    jobId: "",
  });
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    jobId: string;
    job?: PendingJob;
  }>({
    open: false,
    jobId: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");

  const loadPendingJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load pending jobs:", error);
      toast.error("Gagal memuat data pekerjaan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const handleApprove = async () => {
    if (!approveDialog.jobId) return;

    setProcessing(approveDialog.jobId);
    const result = await approveJob(approveDialog.jobId);
    if (result.success) {
      toast.success(result.message);
      setApproveDialog({ open: false, jobId: "" });
      await loadPendingJobs();
    } else {
      toast.error(result.error);
      // If job was already processed or not found, close the dialog and refresh
      if (
        result.error?.includes("sudah diproses") ||
        result.error?.includes("tidak ditemukan")
      ) {
        setApproveDialog({ open: false, jobId: "" });
        await loadPendingJobs();
      }
    }
    setProcessing(null);
  };

  const openApproveDialog = (jobId: string, job: PendingJob) => {
    setApproveDialog({ open: true, jobId, job });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Silakan isi alasan penolakan");
      return;
    }

    setProcessing(rejectDialog.jobId);
    const result = await rejectJob(rejectDialog.jobId, rejectionReason);
    if (result.success) {
      toast.success(result.message);
      setRejectDialog({ open: false, jobId: "" });
      setRejectionReason("");
      await loadPendingJobs();
    } else {
      toast.error(result.error);
      // If job was already processed or not found, close the dialog and refresh
      if (
        result.error?.includes("sudah diproses") ||
        result.error?.includes("tidak ditemukan")
      ) {
        setRejectDialog({ open: false, jobId: "" });
        setRejectionReason("");
        await loadPendingJobs();
      }
    }
    setProcessing(null);
  };

  const openRejectDialog = (jobId: string, job: PendingJob) => {
    setRejectDialog({ open: true, jobId, job });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Tidak ada lowongan yang menunggu persetujuan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lowongan Menunggu Persetujuan ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lowongan</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Gaji</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{job.title}</div>
                    </TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      <JobTypeBadge type={job.job_type as any} />
                    </TableCell>
                    <TableCell>
                      {job.salary_min && job.salary_max
                        ? `${formatRupiah(job.salary_min)} – ${formatRupiah(job.salary_max)}`
                        : "Dirahasikan"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{job.location}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(job.id, job)}
                          disabled={processing === job.id}
                        >
                          {processing === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(job.id, job)}
                          disabled={processing === job.id}
                        >
                          {processing === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, jobId: "", job: undefined })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tolak Lowongan</DialogTitle>
            <DialogDescription>
              Tinjau detail lowongan dan berikan alasan penolakan
            </DialogDescription>
          </DialogHeader>

          {/* Job Details */}
          {rejectDialog.job && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Judul Lowongan
                </p>
                <p className="font-semibold">{rejectDialog.job.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Perusahaan
                  </p>
                  <p>{rejectDialog.job.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipe
                  </p>
                  <JobTypeBadge type={rejectDialog.job.job_type as JobType} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lokasi
                  </p>
                  <p>{rejectDialog.job.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Gaji
                  </p>
                  <p>
                    {rejectDialog.job.salary_min && rejectDialog.job.salary_max
                      ? `${formatRupiah(rejectDialog.job.salary_min)} – ${formatRupiah(rejectDialog.job.salary_max)}`
                      : "Dirahasikan"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Alasan Penolakan <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Contoh: Deskripsi pekerjaan tidak lengkap, informasi gaji tidak valid, persyaratan tidak jelas, dll..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className={!rejectionReason.trim() ? "border-destructive" : ""}
            />
            {!rejectionReason.trim() && (
              <p className="text-sm text-destructive mt-1">
                Silakan isi alasan penolakan
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, jobId: "", job: undefined })
              }
              disabled={processing === rejectDialog.jobId}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                processing === rejectDialog.jobId || !rejectionReason.trim()
              }
            >
              {processing === rejectDialog.jobId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Tolak Lowongan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialog.open}
        onOpenChange={(open) =>
          setApproveDialog({ open, jobId: "", job: undefined })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setujui Lowongan</DialogTitle>
            <DialogDescription>
              Tinjau detail lowongan sebelum menyetujuinya untuk publikasi
            </DialogDescription>
          </DialogHeader>

          {/* Job Details */}
          {approveDialog.job && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Judul Lowongan
                </p>
                <p className="font-semibold">{approveDialog.job.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Perusahaan
                  </p>
                  <p>{approveDialog.job.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipe
                  </p>
                  <JobTypeBadge type={approveDialog.job.job_type as any} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lokasi
                  </p>
                  <p>{approveDialog.job.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Gaji
                  </p>
                  <p>
                    {approveDialog.job.salary_min &&
                    approveDialog.job.salary_max
                      ? `${formatRupiah(approveDialog.job.salary_min)} – ${formatRupiah(approveDialog.job.salary_max)}`
                      : "Dirahasikan"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tanggal Pengajuan
                </p>
                <p className="text-sm">
                  {formatDate(approveDialog.job.created_at)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setApproveDialog({ open: false, jobId: "", job: undefined })
              }
              className="p-5 text-md"
              disabled={processing === approveDialog.jobId}
            >
              Batal
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing === approveDialog.jobId}
              className="p-5 text-md"
            >
              {processing === approveDialog.jobId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Setujui dan Terbitkan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
