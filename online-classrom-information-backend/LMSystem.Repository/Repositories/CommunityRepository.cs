using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Repositories
{
    public class CommunityRepository : ICommunityRepository
    {
        private readonly LMOnlineSystemDbContext _db;
        private readonly INotificationRepository _notificationRepo;

        public CommunityRepository(LMOnlineSystemDbContext db, INotificationRepository notificationRepository)
        {
            _db = db;
            _notificationRepo = notificationRepository;

        }
        public async Task<bool> PublishArticleAsync(int articleId, string accountId)
        {
            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == articleId);

            if (article == null || article.IsDeleted) return false;
            if (article.AccountId != accountId) return false;
            if (article.Status == ArticleStatus.Active) return false; // cannot re-publish

            article.Status = ArticleStatus.Active;
            article.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateDraftArticleAsync(int id, string accountId, string title, string? contentHtml, string? coverImage)
        {
            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == id);

            if (article == null || article.IsDeleted) return false;
            if (article.AccountId != accountId) return false;
            if (article.Status != ArticleStatus.Draft) return false; // cannot edit Active

            article.Title = title;
            article.ContentHtml = contentHtml;
            article.CoverImageUrl = coverImage;
            article.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<(IEnumerable<ArticlePost>, int)> GetPublicArticlesAsync(int page, int size, string? search)
        {
            var query = _db.ArticlePosts
                .Where(a => !a.IsDeleted && a.Status == ArticleStatus.Active)
                .Include(a => a.Account)
                .OrderByDescending(a => a.CreatedAt);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = (IOrderedQueryable<ArticlePost>)query.Where(a => a.Title.Contains(search));
            }

            int total = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return (items, total);
        }

        public async Task<(IEnumerable<ArticlePost>, int)> GetUserDraftsAsync(string accountId, int page, int size)
        {
            var query = _db.ArticlePosts
                .Where(a => a.AccountId == accountId && a.Status == ArticleStatus.Draft && !a.IsDeleted)
                .OrderByDescending(a => a.CreatedAt);

            int total = await query.CountAsync();
            var data = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return (data, total);
        }

        public async Task<ArticlePost> CreateArticleAsync(ArticlePost entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            var res = await _db.ArticlePosts.AddAsync(entity);
            await _db.SaveChangesAsync();
            return res.Entity;
        }

        public async Task<(IEnumerable<ArticlePost> Items, int Total)> GetArticlesAsync(int pageNumber, int pageSize, string? search = null)
        {
            var query = _db.ArticlePosts
                .Where(a => !a.IsDeleted)
                .Include(a => a.Account)
                .OrderByDescending(a => a.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(a => a.Title.Contains(search) || a.ContentHtml.Contains(search));
            }

            var total = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<(IEnumerable<ArticlePost>, int)> GetUserArticlesAsync(string accountId, int page, int size)
        {
            var query = _db.ArticlePosts
                .Where(a => a.AccountId == accountId && !a.IsDeleted)
                .OrderByDescending(a => a.CreatedAt);

            int total = await query.CountAsync();
            var data = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return (data, total);
        }

        public async Task<ArticlePost?> GetArticleByIdAsync(int articleId)
        {
            return await _db.ArticlePosts
                .Include(a => a.Account)
                .Include(a => a.Comments).ThenInclude(c => c.Account)
                .Include(a => a.Likes)
                .FirstOrDefaultAsync(a => a.ArticleId == articleId && !a.IsDeleted);
        }

        public async Task<bool> ToggleLikeAsync(int articleId, string accountId)
        {
            var existing = await _db.ArticleLikes
                .FirstOrDefaultAsync(l => l.ArticleId == articleId && l.AccountId == accountId);

            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == articleId);
            if (article == null) return false;

            if (existing == null)
            {
                var like = new ArticleLike
                {
                    ArticleId = articleId,
                    AccountId = accountId,
                    CreatedAt = DateTime.UtcNow
                };
                await _db.ArticleLikes.AddAsync(like);
                article.TotalLikes += 1;
            }
            else
            {
                _db.ArticleLikes.Remove(existing);
                article.TotalLikes = Math.Max(0, article.TotalLikes - 1);
            }

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<ArticleComment> AddCommentAsync(ArticleComment comment)
        {
            comment.CreatedAt = DateTime.UtcNow;
            var res = await _db.ArticleComments.AddAsync(comment);

            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == comment.ArticleId);
            if (article != null)
            {
                article.TotalComments += 1;
            }

            await _db.SaveChangesAsync();
            return res.Entity;
        }

        public async Task<IEnumerable<ArticleComment>> GetCommentsAsync(int articleId)
        {
            return await _db.ArticleComments
                .Where(c => c.ArticleId == articleId)
                .Include(c => c.Account)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }
        public async Task<bool> BlockArticleAsync(int articleId, string adminId, string reason)
        {
            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == articleId);
            if (article == null || article.IsDeleted)
                return false;

            article.Status = ArticleStatus.Block;
            article.BlockReason = reason;
            article.BlockedBy = adminId;
            article.BlockedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            var notification = new Notification
            {
                AccountId = article.AccountId,                 // người nhận thông báo
                SendDate = DateTime.UtcNow,
                Type = "ArticleBlock",
                Title = "Bài viết của bạn đã bị khóa",
                Message = $"Bài viết \"{article.Title}\" đã bị khóa. Lý do: {reason}",
                ModelId = article.ArticleId
            };

            await _notificationRepo.AddNotificationByAccountId(
                article.AccountId,
                notification
            );
            return true;
        }
        public async Task<(IEnumerable<ArticlePost> Items, int Total)> GetBlockedArticlesAsync(int page, int size)
        {
            var query = _db.ArticlePosts
                .Where(a => a.Status == ArticleStatus.Block && !a.IsDeleted)
                .Include(a => a.Account)
                .OrderByDescending(a => a.BlockedAt);

            int total = await query.CountAsync();

            var data = await query
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (data, total);
        }
        public async Task<bool> UnblockArticleAsync(int articleId, string adminId)
        {
            var article = await _db.ArticlePosts.FirstOrDefaultAsync(a => a.ArticleId == articleId);

            if (article == null || article.IsDeleted)
                return false;

            if (article.Status != ArticleStatus.Block)
                return false; // only block state can be unblocked

            article.Status = ArticleStatus.Active;
            article.BlockReason = null;
            article.BlockedBy = null;
            article.BlockedAt = null;
            article.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var notification = new Notification
            {
                AccountId = article.AccountId,
                SendDate = DateTime.UtcNow,
                Type = "ArticleUnblock",
                Title = "Bài viết của bạn đã được mở lại",
                Message = $"Bài viết \"{article.Title}\" đã được mở khóa bởi quản trị viên.",
                ModelId = article.ArticleId
            };

            await _notificationRepo.AddNotificationByAccountId(
                article.AccountId,
                notification
            );

            return true;
        }

    }
    public class ArticleDetailDto
    {
        public int ArticleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ContentHtml { get; set; }
        public string? CoverImageUrl { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string? AuthorName { get; set; }
        public string? AuthorAvatar { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalLikes { get; set; }
        public int TotalComments { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public ArticleStatus Status { get; set; }
        public string? BlockReason { get; set; }
        public DateTime? BlockedAt { get; set; }

    }

    public class BlockArticleDto
    {
        public string Reason { get; set; } = string.Empty;
    }


    public class ArticleSummaryDto
    {
        public int ArticleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public string? CoverImageUrl { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string? AuthorName { get; set; }
        public string? AuthorAvatar { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalLikes { get; set; }
        public int TotalComments { get; set; }
    }

    public class ArticleCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? ContentHtml { get; set; }
        public string? CoverImageUrl { get; set; }
    }
    public class CommentCreateDto
    {
        public string Content { get; set; } = string.Empty;
    }

    public enum ArticleStatus
    {
        Draft = 0,
        Active = 1,
        Block = 2
    }

}