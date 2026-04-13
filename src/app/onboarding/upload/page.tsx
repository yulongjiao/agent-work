"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { tap, success } from "@/lib/haptics";

export default function OBUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = () => {
    tap();
    setUploading(true);
    setTimeout(() => { success(); setDone(true); setTimeout(() => router.push("/onboarding/agent-hello"), 800); }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-[#FAFAFA]">
      <motion.div className="text-center w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center mx-auto mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
        </motion.div>
        <h1 className="text-[24px] font-semibold text-[#1D1D1F] mb-2">上传你的简历</h1>
        <p className="text-[14px] text-[#86868B] leading-relaxed mb-12">这是你与经纪人合作的第一步</p>

        {!uploading && !done && (
          <>
            <motion.div className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer" onClick={handleUpload} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <p className="text-[15px] text-[#86868B]">点击选择简历文件</p>
                <p className="text-[12px] text-[#C7C7CC]">支持 PDF / Word 格式</p>
              </div>
            </motion.div>

            {/* 跳过上传，后续再补 */}
            <motion.button
              className="mt-5 text-[14px] text-[#007AFF] font-medium"
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/onboarding/agent-hello")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              暂时没有，后续再上传
            </motion.button>
            <motion.p
              className="mt-1.5 text-[12px] text-[#C7C7CC] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              经纪人会通过对话了解你，你也可以稍后补充简历
            </motion.p>
          </>
        )}

        {uploading && !done && (
          <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#1D1D1F] truncate">Java后端开发_张明远_2025.pdf</p>
                <p className="text-[12px] text-[#86868B]">3.2 MB</p>
              </div>
            </div>
            <div className="w-full h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
              <motion.div className="h-full bg-black rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.8, ease: "easeInOut" }} />
            </div>
            <p className="text-[13px] text-[#86868B] mt-3">正在上传...</p>
          </motion.div>
        )}

        {done && (
          <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-14 h-14 rounded-full bg-[#34C759]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <p className="text-[16px] font-medium text-[#1D1D1F]">上传成功</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
