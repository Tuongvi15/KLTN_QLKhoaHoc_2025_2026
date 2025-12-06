using AutoMapper;
using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace LMSystem.Repository.Repositories
{
    public class ReportProblemRepository : IReportProblemRepository
    {
        private readonly LMOnlineSystemDbContext _context;

        public ReportProblemRepository(LMOnlineSystemDbContext context)

        {
            this._context = context;
        }

        public async Task<PagedList<ReportProblemListDto>> GetAllReportProblem(PaginationParameter paginationParameter)
        {
            var query = _context.ReportProblems
                .Include(r => r.Account)
                .AsQueryable();

            if (!string.IsNullOrEmpty(paginationParameter.Search))
            {
                query = query.Where(r => r.Title.Contains(paginationParameter.Search));
            }

            var items = await query
                .Select(r => new ReportProblemListDto
                {
                    ReportId = r.ReportId,
                    ReporterName = r.Account.FirstName + " " + r.Account.LastName,
                    Type = r.Type,
                    Title = r.Title,
                    ReportStatus = r.ReportStatus,
                    CreateDate = r.CreateDate
                })
                .ToListAsync();

            return PagedList<ReportProblemListDto>.ToPagedList(
                items,
                paginationParameter.PageNumber,
                paginationParameter.PageSize
            );
        }


        public async Task<ReportProblem> SendRequestAsync(SendRequestModel model)
        {
            var report = new ReportProblem
            {
                AccountId = model.AccountId,
                Type = model.Type.ToString(),
                Title = model.Title,
                Description = model.Description,
                ReportStatus = ReportStatus.Pending.ToString(),
                CreateDate = DateTime.UtcNow,

                ArticleId = model.ArticleId,
                CommentId = model.CommentId
            };

            _context.ReportProblems.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<ResponeModel> ResolveRequestAsync(ResolveRequestModel model)
        {
            var report = await _context.ReportProblems
                .FirstOrDefaultAsync(r => r.ReportId == model.ReportId);

            if (report == null)
                return new ResponeModel { Status = "Error", Message = "Request not found" };

            if (model.Status == ResolveAction.DeleteContent)
            {
                if (report.Type == "Article" && report.ArticleId.HasValue)
                {
                    var article = await _context.ArticlePosts
                        .FirstOrDefaultAsync(a => a.ArticleId == report.ArticleId);
                    if (article != null)
                    {
                        article.IsDeleted = true;   // hoặc _context.Remove(article)
                    }
                }

                if (report.Type == "Comment" && report.CommentId.HasValue)
                {
                    var cmt = await _context.ArticleComments
                        .FirstOrDefaultAsync(c => c.CommentId == report.CommentId);
                    if (cmt != null)
                    {
                        _context.ArticleComments.Remove(cmt);
                    }
                }

                report.ReportStatus = "Resolved";
                report.AdminResponse = model.AdminResponse;
                report.ProcessingDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Content deleted" };
            }

            if (model.Status == ResolveAction.Reject)
            {
                report.ReportStatus = "Rejected";
                report.AdminResponse = model.AdminResponse;
                report.ProcessingDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return new ResponeModel { Status = "Success", Message = "Report rejected" };
            }

            return new ResponeModel { Status = "Error", Message = "Invalid action" };
        }

        public async Task<ReportDetailDto?> GetReportDetail(int reportId)
        {
            var report = await _context.ReportProblems
                .Include(r => r.Account)
                .FirstOrDefaultAsync(r => r.ReportId == reportId);

            if (report == null) return null;

            var dto = new ReportDetailDto
            {
                ReportId = report.ReportId,
                Type = report.Type,
                ReportStatus = report.ReportStatus,
                ReporterName = report.Account?.FirstName + " " + report.Account?.LastName,
                AccountId = report.AccountId,
                Description = report.Description,
                AdminResponse = report.AdminResponse,
                CreateDate = report.CreateDate,
                ProcessingDate = report.ProcessingDate
            };


            if (report.Type == "Article" && report.ArticleId.HasValue)
            {
                dto.Article = await _context.ArticlePosts
                    .Include(a => a.Account)
                    .FirstOrDefaultAsync(a => a.ArticleId == report.ArticleId.Value);
            }

            if (report.Type == "Comment" && report.CommentId.HasValue)
            {
                dto.Comment = await _context.ArticleComments
                    .Include(c => c.Account)
                    .Include(c => c.Article)
                    .FirstOrDefaultAsync(c => c.CommentId == report.CommentId.Value);
            }

            return dto;
        }


    }

    public class ResolveRequestModel
    {
        public int ReportId { get; set; }

        // Action admin muốn thực hiện
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResolveAction Status { get; set; }

        // Admin ghi chú (optional)
        public string? AdminResponse { get; set; }
    }

    public enum ResolveAction
    {
        DeleteContent ,   // Xóa bài viết / comment bị report
        Reject          // Từ chối report
    }


    public class SendRequestModel
    {
        public string AccountId { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]

        public ReportType Type { get; set; } // Article | Comment
        public string Title { get; set; }
        public string Description { get; set; }

        public int? ArticleId { get; set; }
        public int? CommentId { get; set; }
    }

    public enum ReportType
    {
        Article = 1,
        Comment = 2,
        Other = 3
    }
    public class ReportDetailDto
    {
        public int ReportId { get; set; }
        public string? ReporterName { get; set; }
        public string? AccountId { get; set; }           // id của người báo cáo (nếu cần)
        public string? Type { get; set; }
        public string? ReportStatus { get; set; }

        public string? Description { get; set; }         // <-- LÝ DO (bắt buộc)
        public string? AdminResponse { get; set; }      // phản hồi admin (nếu đã xử lý)
        public DateTime? CreateDate { get; set; }
        public DateTime? ProcessingDate { get; set; }

        public ArticlePost? Article { get; set; }
        public ArticleComment? Comment { get; set; }
    }
    public class ReportProblemListDto
    {
        public int ReportId { get; set; }
        public string ReporterName { get; set; }
        public string Type { get; set; }
        public string Title { get; set; } // Tên bài viết hoặc comment rút gọn
        public string ReportStatus { get; set; }
        public DateTime? CreateDate { get; set; }
    }

}
