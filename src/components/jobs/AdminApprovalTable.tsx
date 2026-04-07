'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobTypeBadge, StatusBadge } from './index';
import { approveJob, rejectJob, getPendingJobs } from '@/lib/jobs/actions';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  user_profiles: {
    full_name: string;
    email: string;
  };
}

export function AdminApprovalTable() {
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; jobId: string }>({
    open: false,
    jobId: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const loadPendingJobs = async () => {
    setLoading(true);
    const data = await getPendingJobs();
    setJobs(data);
    setLoading(false);
  };

  const handleApprove = async (jobId: string) => {
    setProcessing(jobId);
    const result = await approveJob(jobId);
    if (result.success) {
      toast.success(result.message);
      await loadPendingJobs();
    } else {
      toast.error(result.error);
    }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Silakan isi alasan penolakan');
      return;
    }

    setProcessing(rejectDialog.jobId);
    const result = await rejectJob(rejectDialog.jobId, rejectionReason);
    if (result.success) {
      toast.success(result.message);
      setRejectDialog({ open: false, jobId: '' });
      setRejectionReason('');
      await loadPendingJobs();
    } else {
      toast.error(result.error);
    }
    setProcessing(null);
  };

  const openRejectDialog = (jobId: string) => {
    setRejectDialog({ open: true, jobId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                  <TableHead>Poster</TableHead>
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
                        ? `Rp ${(job.salary_min / 1000000).toFixed(0)}jt – ${(job.salary_max / 1000000).toFixed(0)}jt`
                        : 'Dirahasikan'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{job.user_profiles.full_name}</div>
                        <div className="text-muted-foreground text-xs">
                          {job.user_profiles.email}
                        </div>
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
                          onClick={() => openRejectDialog(job.id)}
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
                          onClick={() => handleApprove(job.id)}
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
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, jobId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Lowongan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan yang akan dikirim ke pemberi kerja
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Contoh: Deskripsi pekerjaan tidak lengkap, informasi gaji tidak valid, dll..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, jobId: '' })}
              disabled={processing === rejectDialog.jobId}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing === rejectDialog.jobId}
            >
              {processing === rejectDialog.jobId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Tolak Lowongan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
