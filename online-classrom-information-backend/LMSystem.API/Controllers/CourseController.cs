using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Repositories;
using LMSystem.Services.Interfaces;
using LMSystem.Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : Controller
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseRepository)
        {
            _courseService = courseRepository;
        }

        [HttpGet("CourselistPagination")]
        public async Task<IActionResult> GetCourses([FromQuery] CourseFilterParameters filterParams)
        {
            var (Courses, CurrentPage, PageSize, TotalCourses, TotalPages) = await _courseService.GetCoursesWithFilters(filterParams);
            if (!Courses.Any())
            {
                return NotFound();
            }
            var response = new { Courses, CurrentPage, PageSize, TotalCourses, TotalPages };
            return Ok(response);
        }

        [HttpGet("CheckStudentStillLearning/{courseId}")]
        public async Task<IActionResult> CheckStudentStillLearning(int courseId)
        {
            bool has = await _courseService.CheckStudentStillLearning(courseId);
            return Ok(new { hasStudent = has });
        }
        [HttpPost("RequestApproveCourse/{courseId}")]
        [Authorize]
        public async Task<IActionResult> RequestApproveCourse(int courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var res = await _courseService.RequestApproveCourse(courseId, teacherId);
            return Ok(res);
        }
        [HttpPost("ApproveCourse")]
        [Authorize]
        public async Task<IActionResult> ApproveCourse([FromBody] ApproveCourseRequest model)
        {
            var res = await _courseService.ApproveCourse(model);
            return Ok(res);
        }

        [HttpGet("GetApproveHistory/{courseId}")]
        public async Task<IActionResult> GetApproveHistory(int courseId)
        {
            var res = await _courseService.GetApproveHistory(courseId);
            return Ok(res);
        }

        [HttpPost("RequestUnpublishCourse/{courseId}")]
        [Authorize]
        public async Task<IActionResult> RequestUnpublishCourse(int courseId, [FromBody] UnpublishRequest model)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var res = await _courseService.RequestUnpublishCourse(courseId, adminId, model.Reason);
            return Ok(res);
        }

        public class UnpublishRequest
        {
            public string? Reason { get; set; }
        }



        [HttpGet("GetFullCourseDetail")]
        public async Task<IActionResult> GetFullCourseDetail()
        {
            var courses = await _courseService.GetFullCourseDetail();
            if (courses == null)
            {
                return NotFound();
            }
            return Ok(courses);
        }
        // CourseController.cs (thêm trong controller)
        public class PublishRequestModel
        {
            public bool IsActive { get; set; }
        }

        [HttpPut("publish/{courseId}")]
        public async Task<IActionResult> PublishCourse(int courseId, [FromBody] PublishRequestModel model)
        {
            // Optional: validate caller is owner or admin
            // var userId = User.FindFirst(...);

            var res = await _courseService.PublishCourse(courseId, model?.IsActive ?? false);
            if (res == null) return NotFound();
            if (res.Status == "Success") return Ok(res);
            return BadRequest(res);
        }

        //[HttpGet("GetAllCourse")]
        //public async Task<IActionResult> GetAllCourse([FromQuery] PaginationParameter paginationParameter)
        //{
        //    try
        //    {
        //        var response = await _courseService.GetAllCourse(paginationParameter);
        //        var metadata = new
        //        {
        //            response.TotalCount,
        //            response.PageSize,
        //            response.CurrentPage,
        //            response.TotalPages,
        //            response.HasNext,
        //            response.HasPrevious
        //        };
        //        Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
        //        if (!response.Any())
        //        {
        //            return NotFound();
        //        }
        //        return Ok(response);
        //    }
        //    catch
        //    {
        //        return BadRequest();
        //    }
        //}

        [HttpGet("TopFavoritesCourseBaseStudentJoined")]
        public async Task<IActionResult> GetTopCoursesByStudentJoined(int numberOfCourses)
        {
            var courses = await _courseService.GetTopCoursesByStudentJoined(numberOfCourses);
            return Ok(courses);
        }

        [HttpGet("TopFavoritesCourseBaseSales")]
        public async Task<IActionResult> GetTopCoursesBySales(int numberOfCourses)
        {
            var courses = await _courseService.GetTopCoursesBySales(numberOfCourses);
            return Ok(courses);
        }

        [HttpGet("TopFavoritesCourseBaseRating")]
        public async Task<IActionResult> GetTopCoursesByRating(int numberOfCourses)
        {
            var courses = await _courseService.GetTopCoursesByRating(numberOfCourses);
            return Ok(courses);
        }

        [HttpGet("GetCourseDetailById/{courseId}")]
        public async Task<IActionResult> GetCourseDetailByIdAsync(int courseId)
        {
            var courses = await _courseService.GetCourseDetailByIdAsync(courseId);
            if (courses == null)
            {
                return NotFound();
            }
            return Ok(courses);
        }

        [HttpGet("GetCourseDetailByCourseId-v2/{courseId}")]
        public async Task<IActionResult> GetCourseDetailByCourseIdAsync(int courseId)
        {
            var courses = await _courseService.GetCourseDetailByCourseIdAsync(courseId);
            if (courses == null)
            {
                return NotFound();
            }
            return Ok(courses);
        }

        [HttpPost("AddCourse")]
        [Authorize]
        public async Task<IActionResult> AddCourse(AddCourseModel addCourseModel)
        {
            var response = await _courseService.AddCourse(addCourseModel);
            if (response.Status == "Error")
            {
                return Conflict(response);
            }
            return Ok(response);
        }

        [HttpPut("UpdateCourse")]
        [Authorize]
        public async Task<IActionResult> UpdateCourse(UpdateCourseModel updateCourseModel)
        {
            var response = await _courseService.UpdateCourse(updateCourseModel);
            if (response.Status == "Error")
            {
                return Conflict(response);
            }
            return Ok(response);
        }

        [HttpDelete("DeleteCourse")]
        [Authorize]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            var response = await _courseService.DeleteCourse(courseId);
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet("CountTotalCourse")]
        public async Task<IActionResult> CountTotalCourse()
        {
            var response = await _courseService.CountTotalCourse();
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet("CountTotalCourseUpToDate")]
        public async Task<IActionResult> CountTotalCourseUpToDate([FromQuery] DateTime to)
        {
            var response = await _courseService.CountTotalCourseUpToDate(to);
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet("CountTotalCourseByMonth")]
        public async Task<IActionResult> CountTotalCourseByMonth([FromQuery] int year)
        {
            var response = await _courseService.CountTotalCourseByMonth(year);
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet("GetYearList")]
        public async Task<IActionResult> GetYearList()
        {
            var response = await _courseService.GetYearList();
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet("CountStudentPerCourse")]
        public async Task<IActionResult> CountStudentPerCourse()
        {
            var response = await _courseService.CountStudentPerCourse();
            if (response.Status == "Error")
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpGet("GetCoursesByTeacher")]
        [Authorize]
        public async Task<IActionResult> GetCoursesByTeacher(string teacherId)
        {
            var courses = await _courseService.GetCoursesByTeacherIdAsync(teacherId);

            return Ok(courses.Select(c => new {
                c.CourseId,
                c.Title,
                c.ImageUrl,
                c.VideoPreviewUrl,
                c.Price,
                c.CourseIsActive,
                c.IsPublic,
                c.CreateAt,
                c.UpdateAt,
                c.SalesCampaign,
                c.CourseLevel,
                Categories = c.CourseCategories.Select(cc => new {
                    cc.CategoryId,
                    cc.Category.Name
                })
            }));
        }

        [HttpGet("GetStudentsInMyCourse/{courseId}")]
        [Authorize]
        public async Task<IActionResult> GetStudentsInMyCourse(int courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var students = await _courseService.GetStudentsInCourseAsync(courseId, teacherId);

            if (students == null)
                return NotFound(new { message = "Course not found or not yours." });

            return Ok(students);
        }


        [HttpPost("GetStudentsInMyCourses")]
        public async Task<IActionResult> GetStudentsInMyCourses([FromBody] List<int> courseIds, [FromQuery] string teacherId)
        {
            var students = await _courseService.GetStudentsInCoursesAsync(courseIds, teacherId);

            if (students == null || !students.Any())
                return NotFound(new { message = "No students found or courses not belong to you." });

            return Ok(students);
        }

    }
}
