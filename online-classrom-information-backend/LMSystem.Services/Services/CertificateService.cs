using LMSystem.Repository.Data;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class CertificateService : ICertificateService
{
    private readonly LMOnlineSystemDbContext _context;
    private readonly ICertificateAccountRepository _certRepo;
    private readonly ICertificateTemplateRepository _templateRepo;

    public CertificateService(
        LMOnlineSystemDbContext context,
        ICertificateAccountRepository certRepo,
        ICertificateTemplateRepository templateRepo)
    {
        _context = context;
        _certRepo = certRepo;
        _templateRepo = templateRepo;
    }

    public async Task<ResponeModel> IssueCertificateAsync(string accountId, int courseId)
    {
        // 1️⃣ Check registration
        var reg = await _context.RegistrationCourses
            .Include(r => r.Course)
            .Include(r => r.Account)
            .FirstOrDefaultAsync(r =>
                r.AccountId == accountId &&
                r.CourseId == courseId);

        if (reg == null)
            return new ResponeModel("Error", "Không tìm thấy đăng ký khóa học");

        if (reg.IsCompleted != true)
            return new ResponeModel("Error", "Khóa học chưa hoàn thành");

        // 2️⃣ Không cấp trùng
        if (await _certRepo.ExistsAsync(accountId, courseId))
            return new ResponeModel("Success", "Chứng chỉ đã tồn tại");

        // 4️⃣ Tạo record chứng chỉ
        var cert = new CertificateAccount
        {
            AccountId = accountId,
            CourseId = courseId,
            CertificateCode = $"CERT-{DateTime.UtcNow:ddMMmmssfff}",
            IssuedAt = DateTime.UtcNow,
            StudentName = $"{reg.Account.FirstName} {reg.Account.LastName}".Trim(),
            CourseTitle = reg.Course.Title ?? string.Empty
        };


        await _certRepo.CreateAsync(cert);

        return new ResponeModel(
            "Success",
            "Đã cấp chứng chỉ thành công",
            cert
        );
    }

    public async Task<ResponeModel> GetMyCertificatesAsync(string mail)
    {
        var account = await _context.Account.FirstOrDefaultAsync(x => x.Email == mail);
        var list = await _certRepo.GetByAccountAsync(account.Id);

        return new ResponeModel(
            "Success",
            "Danh sách chứng chỉ",
            list
        );
    }

    public class IssueCertificateRequest
    {
        public string AccountId { get; set; } = string.Empty;
        public int CourseId { get; set; }
    }
}
