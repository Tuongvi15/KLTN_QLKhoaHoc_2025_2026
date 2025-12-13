using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using LMSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class TeacherPayoutService : ITeacherPayoutService
{
    private readonly LMOnlineSystemDbContext _db;
    private readonly ITeacherPayoutRepository _payoutRepo;
    private readonly IBankAccountRepository _bankRepo;
    private readonly IAccountService _accountService;
    private readonly IOrderRepository _orderRepo;

    // configuration
    private const decimal TeacherShare = 0.70m;
    private const decimal TaxRate = 0.10m;
    private const int PendingDays = 30;
    private const int MinAccountMonthsToReceive = 3;

    public TeacherPayoutService(
        LMOnlineSystemDbContext db,
        ITeacherPayoutRepository payoutRepo,
        IBankAccountRepository bankRepo,
        IAccountService accountService,
        IOrderRepository orderRepo)
    {
        _db = db;
        _payoutRepo = payoutRepo;
        _bankRepo = bankRepo;
        _accountService = accountService;
        _orderRepo = orderRepo;
    }

    // Generate payout entries per teacher for a month
    public async Task GeneratePayoutForMonthAsync(int month, int year)
    {
        // get all teachers
        var teachers = await _accountService.GetAllTeachers();

        var monthStart = DateTime.SpecifyKind(
            new DateTime(year, month, 1),
            DateTimeKind.Utc);

        var monthEnd = DateTime.SpecifyKind(
            monthStart.AddMonths(1).AddTicks(-1),
            DateTimeKind.Utc);

        // load completed orders in month
        var ordersInMonth = await _db.Orders
            .Include(o => o.Course)
            .Where(o =>
                o.Status == "Completed" &&
                o.PaymentDate >= monthStart &&
                o.PaymentDate <= monthEnd)
            .ToListAsync();

        // group by teacher
        var ordersByTeacher = ordersInMonth
            .GroupBy(o => o.Course.AccountId)
            .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var teacher in teachers)
        {
            var tId = teacher.Id;

            if (!ordersByTeacher.ContainsKey(tId))
                continue;

            // tránh tạo trùng payout
            if (await _payoutRepo.ExistsForTeacherMonthAsync(tId, month, year))
                continue;

            var orders = ordersByTeacher[tId];

            decimal totalGross = 0m;
            decimal available = 0m;
            decimal pending = 0m;
            int totalOrders = 0;

            foreach (var o in orders)
            {
                var orderPrice = (decimal)(o.TotalPrice ?? (o.Course?.Price ?? 0));
                var teacherShare = orderPrice * TeacherShare;

                totalGross += teacherShare;
                available += teacherShare;   // ✅ tạo là available luôn
                totalOrders++;
            }

            // tax on available
            decimal tax = available >= 2000000m
                ? Math.Round(available * TaxRate, 2)
                : 0m;

            decimal net = available - tax;

            // get bank info
            var bank = await _bankRepo.GetPrimaryByAccountIdAsync(tId);

            var payout = new TeacherPayout
            {
                TeacherId = tId,
                TotalGross = totalGross,
                PendingAmount = 0m,           // ✅ luôn = 0
                AvailableAmount = available,  // ✅ có giá trị ngay
                TaxAmount = tax,
                NetAmount = net,
                Month = month,
                Year = year,
                BankName = bank?.BankName ?? string.Empty,
                BankAccountNumber = bank?.AccountNumber ?? string.Empty,
                BankAccountHolder = bank?.AccountHolderName ?? string.Empty,
                BankBranch = bank?.Branch ?? string.Empty,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _payoutRepo.CreateAsync(payout);
        }
    }


    // Returns list for admin table
    public async Task<List<PayoutListItemDto>> GetPayoutListAsync(int month, int year)
    {
        var list = await _payoutRepo.GetByMonthAsync(month, year);

        var result = new List<PayoutListItemDto>(list.Count);
        foreach (var p in list)
        {
            // compute totals for display (we may store totals during generation but double-check)
            // we try to get teacher name from p.Teacher (loaded in repo)
            var tName = p.Teacher != null ? $"{p.Teacher.FirstName} {p.Teacher.LastName}" : p.TeacherId;
            // for mask account number show last 4
            var masked = p.BankAccountNumber.Length > 4 ?
                new string('*', p.BankAccountNumber.Length - 4) + p.BankAccountNumber[^4..] :
                p.BankAccountNumber;

            // compute total orders and courses quickly: we can query orders for that teacher+month
            var monthStart = DateTime.SpecifyKind(new DateTime(year, month, 1), DateTimeKind.Utc);
            var monthEnd = DateTime.SpecifyKind(monthStart.AddMonths(1).AddTicks(-1), DateTimeKind.Utc);


            var orders = await _db.Orders
                .Where(o => o.Status == "Completed" && o.PaymentDate >= monthStart && o.PaymentDate <= monthEnd && o.Course.AccountId == p.TeacherId)
                .ToListAsync();

            var totalOrders = orders.Count;
            var totalCourses = orders.Select(o => o.CourseId).Distinct().Count();

            result.Add(new PayoutListItemDto
            {
                PayoutId = p.PayoutId,
                TeacherId = p.TeacherId,
                TeacherName = tName,
                TotalGross = p.TotalGross,
                PendingAmount = p.PendingAmount,
                AvailableAmount = p.AvailableAmount,
                TaxAmount = p.TaxAmount,
                NetAmount = p.NetAmount,
                Month = p.Month,
                Year = p.Year,
                Status = p.Status,
                BankAccountNumberMasked = masked,
                TotalOrders = totalOrders,
                TotalCourses = totalCourses
            });
        }

        return result;
    }

    public async Task<PayoutDetailDto?> GetPayoutDetailAsync(int payoutId)
    {
        var p = await _payoutRepo.GetByIdAsync(payoutId);
        if (p == null) return null;

        var teacher = p.Teacher ?? await _accountService.GetAccountById(p.TeacherId);
        var bank = new BankDto
        {
            BankName = p.BankName,
            AccountNumber = p.BankAccountNumber,
            AccountHolderName = p.BankAccountHolder,
            Branch = p.BankBranch
        };

        // compute totals (orders and courses)
        var monthStart = DateTime.SpecifyKind(new DateTime(p.Year, p.Month, 1), DateTimeKind.Utc);
        var monthEnd = DateTime.SpecifyKind(monthStart.AddMonths(1).AddTicks(-1), DateTimeKind.Utc);


        var orders = await _db.Orders
            .Include(o => o.Course)
            .Where(o => o.Status == "Completed" && o.PaymentDate >= monthStart && o.PaymentDate <= monthEnd && o.Course.AccountId == p.TeacherId)
            .ToListAsync();

        var totalOrders = orders.Count;
        var totalCourses = orders.Select(o => o.CourseId).Distinct().Count();

        var dto = new PayoutDetailDto
        {
            PayoutId = p.PayoutId,
            TeacherId = p.TeacherId,
            TeacherName = teacher != null ? $"{teacher.FirstName} {teacher.LastName}" : string.Empty,
            TeacherEmail = teacher?.Email ?? string.Empty,
            TotalGross = p.TotalGross,
            PendingAmount = p.PendingAmount,
            AvailableAmount = p.AvailableAmount,
            TaxAmount = p.TaxAmount,
            NetAmount = p.NetAmount,
            Month = p.Month,
            Year = p.Year,
            Status = p.Status,
            Bank = bank,
            TotalOrders = totalOrders,
            TotalCourses = totalCourses,

        };

        return dto;
    }

    public async Task<bool> MarkPaidAsync(int payoutId)
    {
        var p = await _payoutRepo.GetByIdAsync(payoutId);
        if (p == null) return false;

        // only allow if AvailableAmount > 0 and status is not Withdrawn or Locked
        if (p.Status == "Withdrawn" || p.Status == "Locked") return false;

        // Only pay available portion; ensure available amount > 0
        if (p.AvailableAmount <= 0) return false;

        // ❌ REMOVE: check 3 months (no CreatedAt field)
        // --> removed this block:
        // var teacherAccount = await _accountService.GetAccountById(p.TeacherId);
        // var createdAt = teacherAccount.CreatedAt;
        // var activeMonths = ...
        // if (activeMonths < MinAccountMonthsToReceive) return false;

        // mark as withdrawn 
        var ok = await _payoutRepo.MarkPaidAsync(payoutId);

        if (ok)
        {
            // TODO: send notification, record ledger entry, etc.
        }

        return ok;
    }

}
