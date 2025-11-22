import axios from "axios";

export async function downloadExcel(url: string, fileName: string) {
    try {
        const response = await axios.get(url, {
            responseType: "blob",
        });

        // ⭐ Dùng octet-stream để bắt trình duyệt mở Save As
        const blob = new Blob([response.data], {
            type: "application/octet-stream",
        });

        const link = document.createElement("a");
        const downloadUrl = URL.createObjectURL(blob);

        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);

        link.click();

        // ⭐ Revoke URL an toàn
        setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(link);
        }, 100);

    } catch (error) {
        console.error("Excel download failed:", error);
    }
}
