"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateLesson } from "@/app/actions/lesson";
import "react-quill-new/dist/quill.snow.css";

// Tải React-Quill động để tránh lỗi SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo...</p>,
});

const formSchema = z.object({
  text_content: z.string().min(1, {
    message: "Nội dung không được để trống",
  }),
});

// Cấu hình các modules cho Quill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

export const TextContentForm = ({ initialData, courseId, lessonId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [htmlContent, setHtmlContent] = useState(
    initialData?.text_content || "",
  );
  const quillRef = useRef(null);

  // Đảm bảo component chỉ render phía client
  useEffect(() => {
    setIsMounted(true);
    setHtmlContent(initialData?.text_content || "");
  }, [initialData]);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text_content: initialData?.text_content || "",
    },
  });

  useEffect(() => {
    if (initialData?.text_content) {
      form.reset({
        text_content: initialData.text_content,
      });
    }
  }, [initialData, form]);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateLesson(lessonId, { text_content: values.text_content });
      setHtmlContent(values.text_content);
      toast.success("Nội dung bài học đã được cập nhật");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  // Hiển thị nội dung HTML an toàn
  const createMarkup = (html) => {
    return { __html: html };
  };

  const handleQuillChange = (content) => {
    form.setValue("text_content", content, { shouldValidate: true });
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8">Đang tải...</div>
    );
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Nội dung văn bản
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa nội dung
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <div className="mt-4">
          <div
            className="text-sm prose max-w-none bg-white p-4 rounded"
            dangerouslySetInnerHTML={createMarkup(htmlContent)}
          />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="text_content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="bg-white">
                      <ReactQuill
                        ref={quillRef}
                        modules={quillModules}
                        theme="snow"
                        placeholder="Nhập nội dung bài học..."
                        className="min-h-[250px]"
                        value={field.value}
                        onChange={handleQuillChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
