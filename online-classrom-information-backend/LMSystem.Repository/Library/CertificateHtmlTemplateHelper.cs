namespace LMSystem.API.Helper
{
    public class CertificateHtmlTemplateHelper
    {
        public static string CertificateTemplate(
            string STUDENT_NAME,
            string COURSE_NAME,
            string ISSUE_DATE,
            string TEACHER_NAME,
            string CERT_CODE
        )
        {
            return $@"
<!doctype html>
<html>
<head>
<meta charset='utf-8' />
<style>
@page {{
  size: A4 landscape;
  margin: 0;
}}

html, body {{
  width: 297mm;
  height: 210mm;
  margin: 0;
  padding: 0;
}}

body {{
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1f2937;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  border: 6px solid #e5e7eb;
}}

/* ===== RIBBON (ABSOLUTE – KHÔNG TÍNH WIDTH) ===== */
.ribbon {{
  position: absolute;
  top: 0;
  right: 0;
  width: 26mm;
  height: 100%;
  background: #e8f0fe;
  border-left: 1px solid #c7d2fe;
  display: flex;
  justify-content: center;
}}

.ribbon span {{
  margin-top: 60mm;
  writing-mode: vertical-rl;
  letter-spacing: 3px;
  font-size: 14px;
  font-weight: 600;
  color: #0056d2;
}}

/* ===== MAIN CONTAINER ===== */
.main {{
  width: 100%;
  height: 100%;
  padding: 20mm 26mm 20mm 20mm; /* chừa chỗ cho ribbon */
  box-sizing: border-box;
}}

.inner {{
  width: 100%;
  max-width: 210mm; /* KHÓA THEO mm */
}}

/* ===== HEADER ===== */
.header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}}

.brand {{
  font-size: 26px;
  font-weight: 700;
  color: #0056d2;
}}

.certificate-title {{
  font-size: 14px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #4b5563;
}}

/* ===== CONTENT ===== */
.content {{
  margin-top: 28px;
}}

.date {{
  font-size: 14px;
  color: #6b7280;
}}

.text {{
  font-size: 16px;
  color: #374151;
}}

.student-name {{
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 42px;
  font-weight: 700;
  margin: 20px 0;
  color: #111827;
}}

.course-name {{
  font-size: 22px;
  font-weight: 600;
  margin: 14px 0 22px;
  color: #0056d2;
}}

/* ===== SIGNATURE ===== */
.signature {{
  margin-top: 40px;
}}

.signature-line {{
  width: 60mm;
  border-top: 2px solid #0056d2;
  margin-bottom: 6px;
}}

.teacher {{
  font-size: 14px;
  font-weight: 600;
}}

.teacher-title {{
  font-size: 13px;
  color: #6b7280;
}}

/* ===== SEAL ===== */
.seal {{
  position: absolute;
  bottom: 40mm;
  right: 45mm;
  width: 36mm;
  height: 36mm;
  border: 2px solid #0056d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #0056d2;
  background: #ffffff;
}}

/* ===== FOOTER ===== */
.footer {{
  position: absolute;
  bottom: 12mm;
  left: 20mm;
  font-size: 12px;
  color: #6b7280;
}}

.code {{
  font-family: monospace;
  color: #111827;
}}
</style>
</head>

<body>

<div class='ribbon'>
  <span>CHỨNG NHẬN</span>
</div>

<div class='main'>
  <div class='inner'>

    <div class='header'>
      <div class='brand'>eStudyHub</div>
      <div class='certificate-title'>Certificate</div>
    </div>

    <div class='content'>
      <div class='date'>{ISSUE_DATE}</div>

      <div class='text'>Chứng nhận rằng</div>
      <div class='student-name'>{STUDENT_NAME}</div>

      <div class='text'>đã hoàn thành khóa học</div>
      <div class='course-name'>{COURSE_NAME}</div>

      <div class='text'>
        Khóa học trực tuyến do eStudyHub cung cấp
      </div>

      <div class='signature'>
        <div class='signature-line'></div>
        <div class='teacher'>{TEACHER_NAME}</div>
        <div class='teacher-title'>Giảng viên khóa học</div>
      </div>
    </div>

  </div>
</div>

<div class='seal'>
  VERIFIED<br/>CERTIFICATE
</div>

<div class='footer'>
  Mã chứng chỉ: <span class='code'>{CERT_CODE}</span>
</div>

</body>
</html>";
        }
    }
}
