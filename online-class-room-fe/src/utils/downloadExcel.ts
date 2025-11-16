import axios from "axios";

export async function downloadExcel(url: string, fileName: string) {
    try {
        const response = await axios.get(url, {
            responseType: "blob",
        });

        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Excel download failed:", error);
    }
}
