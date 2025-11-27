using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface ICommunityRepository
    {
        Task<ArticlePost> CreateArticleAsync(ArticlePost entity);

        Task<(IEnumerable<ArticlePost> Items, int Total)> GetPublicArticlesAsync(int pageNumber, int pageSize, string? search = null);

        Task<(IEnumerable<ArticlePost> Items, int Total)> GetUserDraftsAsync(string accountId, int pageNumber, int pageSize);

        Task<(IEnumerable<ArticlePost> Items, int Total)> GetUserArticlesAsync(string accountId, int pageNumber, int pageSize);
        Task<bool> BlockArticleAsync(int articleId, string adminId, string reason);

        Task<ArticlePost?> GetArticleByIdAsync(int articleId);

        Task<bool> PublishArticleAsync(int articleId, string accountId);

        Task<bool> UpdateDraftArticleAsync(int articleId, string accountId, string title, string? contentHtml, string? coverImageUrl);

        Task<bool> ToggleLikeAsync(int articleId, string accountId);
        Task<bool> UnblockArticleAsync(int articleId, string adminId);
        Task<(IEnumerable<ArticlePost> Items, int Total)> GetBlockedArticlesAsync(int pageNumber, int pageSize);

        Task<ArticleComment> AddCommentAsync(ArticleComment comment);

        Task<IEnumerable<ArticleComment>> GetCommentsAsync(int articleId);
        Task<(IEnumerable<ArticlePost> Items, int Total)> GetArticlesAsync(int pageNumber, int pageSize, string? search = null);
    }

}
