"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Calendar,
  Lock,
  User,
  Globe,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import { AuditLog } from "@/types/admin";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        search: searchTerm,
        status: statusFilter,
        actionType: actionFilter,
        page: 1,
        pageSize: 100,
      });
      setLogs(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, statusFilter, actionFilter]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hwyati_audit_logs_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              بوابة المشرف العام
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            سجلات الأمان والتدقيق (Security Audit Trail)
          </h1>
          <p className="text-sm text-[#41484d] mt-1.5">
            تتبع وتسجيل كافة العمليات الحساسة، حركات التعديل، محاولات الدخول، وإشعارات الحماية على مدار الساعة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="bg-white hover:bg-slate-50 text-[#00374e] border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-[#0b4f6c]" />
            <span>تصدير السجلات (JSON)</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 mb-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">بحث سريع</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالعملية، اسم المستخدم، الرقم الوطني، أو IP..."
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg pr-10 pl-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">مستوى النتيجة / الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع الحالات</option>
              <option value="Success">عمليات ناجحة (Success)</option>
              <option value="Warning">تنبيهات وملاحظات (Warning)</option>
              <option value="Failed">محاولات فاشلة / محظورة (Failed)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">نوع الإجراء</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع أنواع الإجراءات</option>
              <option value="create">إنشاء وإضافة (Create)</option>
              <option value="update">تعديل وتحديث (Update)</option>
              <option value="delete">حذف وإلغاء (Delete)</option>
              <option value="security">أمني ومحاولات دخول (Security)</option>
              <option value="export">تصدير بيانات (Export)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
            <div className="text-sm font-medium text-slate-500">جاري تحميل سجلات التدقيق...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد سجلات تطابق البحث</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    الإجراء والعملية
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    المستخدم الفاعل
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    الجهة المستهدفة
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    عنوان IP
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    الحالة
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    التاريخ والوقت
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap text-center">
                    تفاصيل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/70 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 text-xs">
                      {log.action}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#191c1e]">{log.userFullName}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {log.userNationalNumber} | {log.userRole}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700">
                      {log.entityName}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {log.ipAddress}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          log.status === "Success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : log.status === "Warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "Success"
                              ? "bg-emerald-600"
                              : log.status === "Warning"
                              ? "bg-amber-600"
                              : "bg-rose-600"
                          }`}
                        ></span>
                        {log.status === "Success" ? "ناجح" : log.status === "Warning" ? "تنبيه" : "فشل / حظر"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString("ar-YE")}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0b4f6c] hover:bg-slate-100"
                        title="عرض تفاصيل السجل الكاملة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#00374e]" />
                <h3 className="text-base font-bold text-[#00374e]">تفاصيل عملية التدقيق</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">الإجراء:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedLog.action}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500">التفاصيل الفنية:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed mt-1">
                  {selectedLog.details || "لا توجد تفاصيل إضافية مسجلة."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-semibold text-slate-500">المستخدم:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedLog.userFullName}</div>
                  <div className="font-mono text-[11px] text-slate-500">{selectedLog.userNationalNumber}</div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500">عنوان IP:</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedLog.ipAddress}</div>
                  <div className="text-[11px] text-slate-500">{selectedLog.userRole}</div>
                </div>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-slate-500">الوقت بالتحديد:</span>
                <div className="font-mono text-slate-700 mt-0.5">
                  {new Date(selectedLog.timestamp).toISOString()}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
