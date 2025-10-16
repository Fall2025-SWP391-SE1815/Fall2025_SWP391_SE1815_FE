// src/services/public/publicVehicleService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const publicVehicleService = {
  async getVehicles() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/vehicles`);
      if (!res.ok) throw new Error("Không thể tải danh sách xe công khai");
      const data = await res.json();

      // Chuẩn hóa đường dẫn ảnh
      return data.map((v) => ({
        ...v,
        imageUrl: v.imageUrl
          ? `${API_BASE_URL}${v.imageUrl.startsWith("/") ? v.imageUrl : `/${v.imageUrl}`}`
          : null,
      }));
    } catch (err) {
      console.error("❌ Lỗi khi tải xe công khai:", err);
      return [];
    }
  },
};

export default publicVehicleService;
