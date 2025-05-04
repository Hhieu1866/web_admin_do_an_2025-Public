"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { updateUserInfo } from '@/app/actions/account';
import { Loader2, Save } from "lucide-react";

const PersonalDetails = ({userInfo}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [infoState, setInfoState] = useState({
        "firstName" : userInfo.firstName || "",
        "lastName" : userInfo.lastName || "",
        "email" : userInfo.email || "",
        "designation" : userInfo.designation || "",
        "bio" : userInfo.bio || "", 
    });

    const handleChange = (event) => {
        const field = event.target.name;
        const value = event.target.value;
        setInfoState({
            ...infoState, [field]: value
        });
    }

    const handleUpdate = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await updateUserInfo(userInfo?.email, infoState);
            toast.success("Thông tin đã được cập nhật thành công");
        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleUpdate}>
            <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Thông tin cá nhân
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Cập nhật thông tin cá nhân của bạn
                    </CardDescription>
                </CardHeader>
                <Separator className="mb-6" />
                <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                Họ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={infoState?.firstName}
                                onChange={handleChange}
                                placeholder="Nhập họ của bạn"
                                required
                                className="focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={infoState?.lastName}
                                onChange={handleChange}
                                placeholder="Nhập tên của bạn"
                                required
                                className="focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={infoState?.email}
                                onChange={handleChange}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Email không thể thay đổi
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Nghề nghiệp</Label>
                            <Input
                                id="designation"
                                name="designation"
                                value={infoState?.designation}
                                onChange={handleChange}
                                placeholder="Nhập nghề nghiệp của bạn"
                                className="focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Giới thiệu bản thân</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={infoState?.bio}
                            onChange={handleChange}
                            placeholder="Viết một vài điều về bản thân bạn..."
                            rows={4}
                            className="resize-none focus:ring-primary"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end px-0 pt-6">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default PersonalDetails;