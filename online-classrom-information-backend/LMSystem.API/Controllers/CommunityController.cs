using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMSystem.API.Controllers
{
    [Route("api/community")]
    [ApiController]
    public class CommunityController : ControllerBase
    {
        private readonly ICommunityRepository _repo;
        private readonly LMSystem.Repository.Interfaces.IAccountRepository _accountRepo;

        public CommunityController(ICommunityRepository repo, LMSystem.Repository.Interfaces.IAccountRepository accountRepo)
        {
            _repo = repo;
            _accountRepo = accountRepo;
        }

        // create article (Teacher & Student only)
        [HttpPost("article")]
        [Authorize]
        public async Task<IActionResult> CreateArticle([FromBody] ArticleCreateDto dto)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG

            // Fallback: if JWT stores name as email, resolve id by AccountRepo
            if (string.IsNullOrEmpty(accountId))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot determine user id" });
            }

            var article = new ArticlePost
            {
                AccountId = accountId,
                Title = dto.Title,
                ContentHtml = dto.ContentHtml,
                CoverImageUrl = dto.CoverImageUrl
            };

            var created = await _repo.CreateArticleAsync(article);

            return Ok(new { Status = "Success", Message = "Article created", Data = new { created.ArticleId } });
        }

        // list articles (paged)
        [HttpGet("articles")]
        public async Task<IActionResult> GetArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? q = null)
        {
            var (items, total) = await _repo.GetArticlesAsync(page, pageSize, q);

            var summaries = items.Select(a => new ArticleSummaryDto
            {
                ArticleId = a.ArticleId,
                Title = a.Title,
                Excerpt = (a.ContentHtml ?? "").Length > 300 ? (a.ContentHtml ?? "").Substring(0, 300) + "..." : a.ContentHtml,
                CoverImageUrl = a.CoverImageUrl,
                AuthorId = a.AccountId,
                AuthorName = a.Account != null ? (a.Account.FirstName + " " + a.Account.LastName).Trim() : null,
                AuthorAvatar = a.Account?.ProfileImg,
                CreatedAt = a.CreatedAt,
                TotalLikes = a.TotalLikes,
                TotalComments = a.TotalComments
            }).ToList();

            return Ok(new { Status = "Success", Items = summaries, Total = total });
        }

        [Authorize]
        [HttpPost("article/{id}/block")]
        public async Task<IActionResult> BlockArticle(int id, [FromBody] BlockArticleDto dto)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var adminId = account.Id;   // ← GIÁ TRỊ ĐÚNG


            var ok = await _repo.BlockArticleAsync(id, adminId!, dto.Reason);

            if (!ok)
                return BadRequest(new { Status = "Error", Message = "Cannot block article" });

            return Ok(new { Status = "Success", Message = "Article blocked" });
        }

        // get article detail
        [HttpGet("article/{id}")]
        public async Task<IActionResult> GetArticle(int id)
        {
            var a = await _repo.GetArticleByIdAsync(id);
            if (a == null)
                return NotFound(new { Status = "Error", Message = "Article not found" });

            string? email = User.Identity!.IsAuthenticated
                ? User.FindFirstValue(ClaimTypes.Name)
                : null;

            string? currentUserId = null;

            if (!string.IsNullOrEmpty(email))
            {
                var account = await _accountRepo.GetAccountByEmail(email);
                currentUserId = account?.Id;
            }

            bool isLiked = false;
            if (currentUserId != null)
                isLiked = a.Likes.Any(l => l.AccountId == currentUserId);

            var dto = new ArticleDetailDto
            {
                ArticleId = a.ArticleId,
                Title = a.Title,
                ContentHtml = a.ContentHtml,
                CoverImageUrl = a.CoverImageUrl,
                AuthorId = a.AccountId,
                AuthorName = a.Account != null ? (a.Account.FirstName + " " + a.Account.LastName).Trim() : null,
                AuthorAvatar = a.Account?.ProfileImg,
                CreatedAt = a.CreatedAt,
                TotalLikes = a.TotalLikes,
                TotalComments = a.TotalComments,
                IsLikedByCurrentUser = isLiked,
                Status = a.Status,
                BlockReason = a.BlockReason,
                BlockedAt = a.BlockedAt
            };

            return Ok(new { Status = "Success", Data = dto });
        }


        // toggle like (Teacher & Student)
        [HttpPost("article/{id}/like")]
        [Authorize]
        public async Task<IActionResult> LikeArticle(int id)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG

            if (string.IsNullOrEmpty(accountId)) return Unauthorized();

            var ok = await _repo.ToggleLikeAsync(id, accountId);
            if (!ok) return NotFound(new { Status = "Error", Message = "Article not found" });

            var article = await _repo.GetArticleByIdAsync(id);
            return Ok(new { Status = "Success", TotalLikes = article?.TotalLikes ?? 0 });
        }

        // add comment
        [HttpPost("article/{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentCreateDto dto)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG

            if (string.IsNullOrEmpty(accountId)) return Unauthorized();

            var article = await _repo.GetArticleByIdAsync(id);
            if (article == null) return NotFound(new { Status = "Error", Message = "Article not found" });

            var comment = new ArticleComment
            {
                ArticleId = id,
                AccountId = accountId,
                Content = dto.Content
            };

            var added = await _repo.AddCommentAsync(comment);

            return Ok(new { Status = "Success", Data = new { added.CommentId, added.CreatedAt } });
        }

        [HttpGet("articles/public")]
        public async Task<IActionResult> GetPublicArticles(int page = 1, int pageSize = 10, string? q = null)
        {
            var (items, total) = await _repo.GetPublicArticlesAsync(page, pageSize, q);

            return Ok(new
            {
                Status = "Success",
                Total = total,
                Items = items.Select(x => new {
                    x.ArticleId,
                    x.Title,
                    x.CoverImageUrl,
                    x.TotalLikes,
                    x.TotalComments,
                    AuthorName = x.Account?.FirstName + " " + x.Account?.LastName,
                    x.CreatedAt
                })
            });
        }

        [Authorize]
        [HttpGet("articles/my-drafts")]
        public async Task<IActionResult> GetDrafts(int page = 1, int pageSize = 10)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG


            var (items, total) = await _repo.GetUserDraftsAsync(accountId, page, pageSize);

            return Ok(new { Status = "Success", Total = total, Items = items });
        }

        [Authorize]
        [HttpPut("article/{id}")]
        public async Task<IActionResult> UpdateDraft(int id, [FromBody] ArticleCreateDto dto)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG


            var ok = await _repo.UpdateDraftArticleAsync(id, accountId, dto.Title, dto.ContentHtml, dto.CoverImageUrl);
            if (!ok) return BadRequest(new { Status = "Error", Message = "Cannot edit article" });

            return Ok(new { Status = "Success", Message = "Draft updated" });
        }


        [Authorize]
        [HttpPost("article/{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG


            var ok = await _repo.PublishArticleAsync(id, accountId);
            if (!ok) return BadRequest(new { Status = "Error", Message = "Cannot publish article" });

            return Ok(new { Status = "Success", Message = "Published" });
        }



        // get comments
        [HttpGet("article/{id}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            var comments = await _repo.GetCommentsAsync(id);
            var result = comments.Select(c => new
            {
                c.CommentId,
                c.AccountId,
                AuthorName = c.Account != null ? (c.Account.FirstName + " " + c.Account.LastName).Trim() : null,
                AuthorAvatar = c.Account?.ProfileImg,
                c.Content,
                c.CreatedAt
            });
            return Ok(new { Status = "Success", Items = result });
        }

        [Authorize]
        [HttpGet("articles/blocked")]
        public async Task<IActionResult> GetBlockedArticles(int page = 1, int pageSize = 10)
        {
            var (items, total) = await _repo.GetBlockedArticlesAsync(page, pageSize);

            var result = items.Select(a => new
            {
                a.ArticleId,
                a.Title,
                a.CoverImageUrl,
                a.BlockReason,
                a.BlockedAt,
                BlockedBy = a.BlockedBy,
                Author = new
                {
                    a.AccountId,
                    FullName = a.Account != null
                        ? a.Account.FirstName + " " + a.Account.LastName
                        : null,
                    Avatar = a.Account?.ProfileImg
                },
                a.CreatedAt,
            });

            return Ok(new { Status = "Success", Total = total, Items = result });
        }
        [Authorize]
        [HttpPost("article/{id}/unblock")]
        public async Task<IActionResult> UnblockArticle(int id)
        {
            // Email trong token
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { Status = "Error", Message = "Cannot get email from token" });
            }

            // Lookup trong database
            var account = await _accountRepo.GetAccountByEmail(email);
            if (account == null)
            {
                return Unauthorized(new { Status = "Error", Message = "Account not found" });
            }

            var accountId = account.Id;   // ← GIÁ TRỊ ĐÚNG


            var ok = await _repo.UnblockArticleAsync(id, accountId!);

            if (!ok)
                return BadRequest(new { Status = "Error", Message = "Cannot unblock article" });

            return Ok(new { Status = "Success", Message = "Article unblocked" });
        }

    }
}
