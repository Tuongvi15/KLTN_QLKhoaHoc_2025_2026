using LMSystem.Repository.Data;
using LMSystem.Repository.Models;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingCourseController : Controller
    {
        private readonly IRatingCourseService _ratingCourseService;

        public RatingCourseController(IRatingCourseService ratingCourseService)
        {
            _ratingCourseService = ratingCourseService;
        }

        [HttpPost("RatingCourse")]
        [Authorize]
        public async Task<ActionResult> AddRating([FromQuery] AddRatingModel addRatingModel, [FromQuery] int registrationId)
        {
            var ratingCourse = new RatingCourse
            {
                RegistrationId = registrationId, 
                RatingStar = addRatingModel.RatingStar,
                CommentContent = addRatingModel.CommentContent,
                RatingDate = DateTime.UtcNow, 
                IsRatingStatus = true 
            };

            var addedRating = await _ratingCourseService.AddRatingAsync(ratingCourse);
            return CreatedAtAction(nameof(AddRating), new { id = addedRating.RatingId }, addedRating);
        }

        [HttpGet("ViewCourseRating/{courseId}")]
        public async Task<IActionResult> GetCourseRating(int courseId)
        {
            var averageRating = await _ratingCourseService.GetCourseRating(courseId);
            if (averageRating == null)
            {
                return NotFound("No ratings found for this course.");
            }
            return Ok(new { AverageRating = averageRating });
        }

        [HttpGet("List/{courseId}")]
        public async Task<IActionResult> GetCourseRatingList(int courseId)
        {
            var ratings = await _ratingCourseService.GetCourseRatingList(courseId);
            if (ratings == null || !ratings.Any())
                return Ok(new List<object>());

            var result = ratings.Select(r => new {
                ratingId = r.RatingId,
                rating = r.RatingStar,
                comment = r.CommentContent,
                ratingDate = r.RatingDate,
                userName = r.Registration.Account.FirstName + " " + r.Registration.Account.LastName,
                avatarUrl = r.Registration.Account.ProfileImg
            });

            return Ok(result);
        }

    }
}
