import { Card, Typography, Skeleton } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
    useGetMyCertificatesQuery,
    useLazyGetCertificateByAccountAndCourseQuery,
} from '../../../services/account.services';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

const MyCertificatesPage = () => {
    const accountId = useSelector((state: RootState) => state.user.id);

    // =============================
    // API
    // =============================
    const { data: certificates, isLoading } = useGetMyCertificatesQuery();
    const [getCertificateHtml] = useLazyGetCertificateByAccountAndCourseQuery();

    // =============================
    // STATE
    // =============================
    const [open, setOpen] = useState(false);
    const [html, setHtml] = useState('');
    const certificateRef = useRef<HTMLDivElement>(null);

    // =============================
    // HANDLERS
    // =============================
    const handleOpenCertificate = async (courseId: number) => {
        try {
            const html = await getCertificateHtml({
                accountId,
                courseId,
            }).unwrap();

            setHtml(html);
            setOpen(true);
        } catch (e) {
            console.error('Không lấy được certificate', e);
        }
    };

    const handleExportPdf = () => {
        if (!certificateRef.current) return;

        const opt = {
            margin: 0,
            filename: 'certificate.pdf',
            image: {
                type: 'jpeg' as const,
                quality: 0.98,
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'landscape' as const,
            },
        };

        html2pdf()
            .set({
                margin: 0,
                filename: 'certificate.pdf',
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 1.5, // 🔥 GIẢM SCALE
                    useCORS: true,
                    windowWidth: 1122, // 297mm ≈ 1122px
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape' as const,
                },
            })
            .from(certificateRef.current)
            .save();

    };


    // =============================
    // RENDER
    // =============================
    return (
        <div className="p-6">
            <Typography.Title level={3}>
                🎓 Chứng chỉ của tôi
            </Typography.Title>

            {isLoading && <Skeleton active />}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {certificates?.map((c: any) => (
                    <Card
                        key={c.certificateId}
                        hoverable
                        onClick={() => handleOpenCertificate(c.courseId)}
                        className="cursor-pointer"
                    >
                        <Typography.Title level={5}>
                            {c.courseTitle}
                        </Typography.Title>

                        <Typography.Text type="secondary">
                            Ngày cấp:{' '}
                            {new Date(c.issuedAt).toLocaleDateString()}
                        </Typography.Text>

                        <div className="mt-2 text-xs text-gray-500">
                            Mã: {c.certificateCode}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ===== MODAL VIEW CERTIFICATE ===== */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle className="flex justify-between items-center">
                    🎉 Chứng chỉ
                    <div className="flex gap-2">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleExportPdf}
                        >
                            Xuất PDF
                        </Button>
                        <Button onClick={() => setOpen(false)}>
                            <CloseIcon />
                        </Button>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    <div
                        ref={certificateRef}
                        style={{ minHeight: 600 }}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyCertificatesPage;
