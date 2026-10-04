import React from 'react';
import { BookMarked, X, Terminal, Globe, Rocket, HelpCircle, CheckCircle } from 'lucide-react';
import { playClick } from '../../utils/audio';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppGuideModal: React.FC<AppGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookMarked size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Hướng dẫn Sử dụng & Xuất bản Ứng dụng
              </h3>
              <p className="text-xs text-slate-500">
                Dành cho giáo viên, phụ huynh và người triển khai
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-5 space-y-6 text-sm text-slate-700">

          {/* Section 1: Hướng dẫn học sinh */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <h4 className="font-extrabold text-amber-950 flex items-center gap-2 mb-2 text-base">
              <HelpCircle size={18} className="text-amber-700" />
              1. Hướng dẫn học sinh thao tác
            </h4>
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
              <p>
                ⚖️ <strong>Cân đĩa:</strong> Em có thể kéo quả cân hoặc đồ vật thả vào đĩa trái/phải; hoặc bấm chọn vật trước rồi bấm vào đĩa cân để đặt. Bấm vào vật trên đĩa nếu muốn lấy ra. Quan sát đòn cân thăng bằng hay nghiêng về bên nào.
              </p>
              <p>
                🕒 <strong>Đồng hồ:</strong> Em có thể dùng ngón tay hoặc chuột để kéo kim phút, hoặc bấm các nút tăng/giảm giờ và phút bên dưới để đặt giờ chính xác.
              </p>
            </div>
          </div>

          {/* Section 2: Cách chạy trên máy tính cá nhân */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-2 text-base">
              <Terminal size={18} className="text-slate-700" />
              2. Lệnh chạy và kiểm thử cục bộ (Local)
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>Cài đặt gói thư viện cần thiết:</p>
              <pre className="p-2.5 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono overflow-x-auto">
                npm install
              </pre>
              <p className="mt-2">Khởi động máy chủ thử nghiệm:</p>
              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
                npm run dev
              </pre>
              <p className="text-xs text-slate-500">
                Mở trình duyệt tại địa chỉ hiển thị (thường là <code>http://localhost:3000</code>).
              </p>
            </div>
          </div>

          {/* Section 3: Xây dựng & Xuất bản (Build & Deploy) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
            <h4 className="font-extrabold text-blue-950 flex items-center gap-2 mb-2 text-base">
              <Rocket size={18} className="text-blue-700" />
              3. Xây dựng và xuất bản trang web miễn phí
            </h4>
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
              <p>Biên dịch mã nguồn thành thư mục tĩnh để tải lên hosting:</p>
              <pre className="p-2.5 bg-slate-900 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto">
                npm run build
              </pre>
              <p>
                Thư mục kết quả <code>dist/</code> chứa toàn bộ HTML, CSS và JavaScript thuần, sẵn sàng đưa lên:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>
                  <strong>Vercel / Netlify:</strong> Kéo thả thư mục <code>dist</code> hoặc liên kết với kho mã nguồn GitHub để tự động xuất bản (Build Command: <code>npm run build</code>, Output Directory: <code>dist</code>).
                </li>
                <li>
                  <strong>GitHub Pages:</strong> Sử dụng lệnh <code>gh-pages -d dist</code> để chạy trang web hoàn toàn miễn phí.
                </li>
                <li>
                  <strong>Cloudflare Pages:</strong> Tải trực tiếp thư mục <code>dist</code> lên Cloudflare Pages.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Tính độc lập & An toàn */}
          <div className="border border-emerald-200 bg-emerald-50/60 rounded-2xl p-3.5 flex items-start gap-2.5">
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              Ứng dụng 100% chạy trên trình duyệt người dùng (Client-Side), không yêu cầu máy chủ cơ sở dữ liệu ngoài, không cần tài khoản, hoàn toàn an toàn và miễn phí cho học sinh tiểu học.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-xs text-sm transition-all active:scale-95"
          >
            Đã hiểu, quay lại học
          </button>
        </div>

      </div>
    </div>
  );
};
