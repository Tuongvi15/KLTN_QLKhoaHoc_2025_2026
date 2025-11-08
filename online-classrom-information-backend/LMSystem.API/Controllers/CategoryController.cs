using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost("AddCategory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCategory(AddCategoryModel model)
        {
            var response = await _categoryService.AddCategory(model);

            if (response.Status == "Error")
            {
                return Conflict(response);
            }

            return Ok(response);
        }
        [HttpDelete("DeleteCategory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int categoryId)
        {
            var response = await _categoryService.DeleteCategory(categoryId);

            if (response.Status == "Error")
            {
                return Conflict(response);
            }

            return Ok(response);
        }
        [HttpGet("GetAllCategory")]
        public async Task<IActionResult> GetAllCategory([FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                var response = await _categoryService.GetAllCategory(paginationParameter);
                var metadata = new
                {
                    response.TotalCount,
                    response.PageSize,
                    response.CurrentPage,
                    response.TotalPages,
                    response.HasNext,
                    response.HasPrevious
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
                if (!response.Any())
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch
            {
                return BadRequest();
            }
        }

        [HttpPut("UpdateCategory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(UpdateCategoryModel model)
        {
            var response = await _categoryService.UpdateCategory(model);

            if (response.Status == "Error")
            {
                return Conflict(response);
            }

            return Ok(response);
        }

        [HttpGet("by-field/{fieldId}")]
        public async Task<IActionResult> GetCategoriesByFieldId(int fieldId)
        {
            var response = await _categoryService.GetCategoriesByFieldIdAsync(fieldId);

            // ✅ Nếu không có category, vẫn trả về 200 với mảng rỗng
            if (response.DataObject == null)
            {
                response.DataObject = new List<object>();
                response.Status = "Success";
                response.Message = "No categories found for this field";
            }

            return Ok(response);
        }


        [HttpGet("by-cate")]
        public async Task<IActionResult> GetFieldsWithCategories()
        {
            var result = await _categoryService.GetFieldsWithCategories();
            if (result.Status == "Error")
                return NotFound(result);

            return Ok(result);
        }
    }
}
