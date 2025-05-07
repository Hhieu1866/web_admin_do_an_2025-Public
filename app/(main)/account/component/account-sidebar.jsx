"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import Menu from "./account-menu";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/queries/users";
import { toast } from "sonner";
import { Loader2, Camera, Upload, Trash2 } from "lucide-react";
import ConfirmDialog from "@/app/components/confirm-dialog";

const AccountSidebar = ({ loggedInUser }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Hàm xử lý khi click vào nút thay đổi ảnh
  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  // Hàm xử lý khi image load bị lỗi
  const handleImageError = () => {
    setImageError(true);
    console.warn("Không thể tải ảnh đại diện:", loggedInUser?.profilePicture);
  };

  // Hàm xử lý khi image load thành công
  const handleImageLoad = () => {
    setImageError(false);
  };

  // Hàm xử lý khi chọn file ảnh mới
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", loggedInUser?.email);

      // Gọi API upload avatar
      const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      // Xử lý kết quả
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lỗi không xác định");
      }

      // Thông báo thành công
      toast.success(result.message || "Đã cập nhật ảnh đại diện");

      // Làm mới trang để hiển thị ảnh mới
      window.location.reload();

      // Reset input file sau khi hoàn thành
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Không thể tải lên ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm xử lý xóa ảnh đại diện
  const handleDeleteAvatar = async () => {
    if (!loggedInUser?.email) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setIsUploading(true);

      // Gọi API xóa avatar
      const response = await fetch("/api/profile/delete-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loggedInUser.email }),
      });

      // Xử lý kết quả
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lỗi không xác định");
      }

      // Thông báo thành công
      toast.success(result.message || "Đã xóa ảnh đại diện");

      // Làm mới trang để cập nhật UI
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Không thể xóa ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="lg:col-span-3 md:col-span-4">
      <div className="p-6 rounded-md shadow dark:shadow-gray-800 bg-white dark:bg-slate-900 sticky top-20">
        <div className="profile-pic text-center mb-5">
          <div>
            <div
              className="relative mx-auto cursor-pointer"
              style={{ width: "112px", height: "112px" }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleChangeAvatar}
            >
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {loggedInUser?.profilePicture && !imageError ? (
                  <Image
                    src={loggedInUser.profilePicture}
                    alt="user"
                    fill
                    sizes="112px"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    priority
                    className="rounded-full"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    unoptimized={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-medium">
                    {loggedInUser?.firstName?.[0] || ""}
                    {loggedInUser?.lastName?.[0] || ""}
                  </div>
                )}
              </div>

              {/* Overlay khi hover */}
              {isHovering && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              )}

              <div className="absolute inset-0 rounded-full shadow dark:shadow-gray-800 ring-4 ring-slate-50 dark:ring-slate-800 pointer-events-none"></div>

              {/* Input ẩn để upload file */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
                key={loggedInUser?.profilePicture || "no-image"}
              />
            </div>

            {/* Nút thay đổi ảnh và xóa ảnh */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleChangeAvatar}
                disabled={isUploading}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Đổi ảnh</span>
              </Button>

              {loggedInUser?.profilePicture && !imageError && (
                <ConfirmDialog
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa ảnh đại diện này không?"
                  confirmText="Xóa"
                  cancelText="Hủy"
                  variant="destructive"
                  onConfirm={handleDeleteAvatar}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                    disabled={isUploading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa ảnh</span>
                  </Button>
                </ConfirmDialog>
              )}
            </div>

            <div className="mt-4">
              <h5 className="text-lg font-semibold">
                {`${loggedInUser?.firstName} ${loggedInUser?.lastName}`}
              </h5>
              <p className="text-slate-400">{loggedInUser?.email}</p>
              <p className="text-slate-700 text-sm font-bold">
                Role: {loggedInUser?.role}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700">
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
