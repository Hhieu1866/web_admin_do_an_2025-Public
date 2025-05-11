"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";

export const DownloadCertificate = ({ courseId, totalProgress }) => {
  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);

  async function handleCertificateDownload() {
    try {
      setIsCertificateDownloading(true);
      fetch(`/api/certificate?courseId=${courseId}`)
        .then((respone) => respone.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Chứng_chỉ_hoàn_thành.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      toast.success("Chứng chỉ đã được tải xuống thành công");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCertificateDownloading(false);
    }
  }

  return (
    <Button
      onClick={handleCertificateDownload}
      disabled={totalProgress < 100 || isCertificateDownloading}
      className="w-full justify-start gap-2"
      size="lg"
    >
      <Award className="h-4 w-4 text-primary" />
      {isCertificateDownloading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Đang tải...</span>
        </div>
      ) : (
        "Tải chứng chỉ hoàn thành"
      )}
    </Button>
  );
};
