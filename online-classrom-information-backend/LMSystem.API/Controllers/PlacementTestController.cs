using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacementTestController : ControllerBase
    {
        private readonly IPlacementTestRepository _placementRepo;

        public PlacementTestController(IPlacementTestRepository placementRepo)
        {
            _placementRepo = placementRepo;
        }

        // ==================== FIELD ====================

        [HttpGet("fields")]
        public async Task<IActionResult> GetAllFields()
        {
            var result = await _placementRepo.GetAllFields();
            return Ok(result);
        }

        [HttpPost("fields")]
        public async Task<IActionResult> AddField([FromBody] AddFieldModel model)
        {
            if (string.IsNullOrEmpty(model.Name))
                return BadRequest(new { message = "Field name is required" });

            var result = await _placementRepo.AddField(model.Name, model.Description);
            return Ok(result);
        }

        [HttpDelete("fields/{id}")]
        public async Task<IActionResult> DeleteField(int id)
        {
            var result = await _placementRepo.DeleteField(id);
            return Ok(result);
        }

        // ==================== PLACEMENT TEST ====================

        [HttpGet("tests")]
        public async Task<IActionResult> GetAllPlacementTests()
        {
            var result = await _placementRepo.GetAllPlacementTests();
            return Ok(result);
        }

        [HttpGet("tests/field/{fieldId}")]
        public async Task<IActionResult> GetTestsByField(int fieldId)
        {
            var result = await _placementRepo.GetPlacementTestsByField(fieldId);
            return Ok(result);
        }

        [HttpGet("tests/{testId}")]
        public async Task<IActionResult> GetTestById(int testId)
        {
            var result = await _placementRepo.GetPlacementTestById(testId);
            if (result == null)
                return NotFound(new { message = "Placement test not found" });
            return Ok(result);
        }

        [HttpPost("tests")]
        public async Task<IActionResult> AddPlacementTest([FromBody] AddPlacementTestModel model)
        {
            if (string.IsNullOrEmpty(model.Title))
                return BadRequest(new { message = "Test title is required" });

            var result = await _placementRepo.AddPlacementTest(model);
            return Ok(result);
        }

        [HttpPut("tests/{id}")]
        public async Task<IActionResult> UpdatePlacementTest(int id, [FromBody] UpdatePlacementTestModel model)
        {
            model.PlacementTestId = id;
            var result = await _placementRepo.UpdatePlacementTest(model);
            return Ok(result);
        }

        [HttpDelete("tests/{id}")]
        public async Task<IActionResult> DeletePlacementTest(int id)
        {
            var result = await _placementRepo.DeletePlacementTest(id);
            return Ok(result);
        }

        // ==================== QUESTION ====================

        [HttpGet("questions/{testId}")]
        public async Task<IActionResult> GetQuestionsByTestId(int testId)
        {
            var result = await _placementRepo.GetQuestionsByTestId(testId);
            return Ok(result);
        }

        [HttpPost("questions")]
        public async Task<IActionResult> AddPlacementQuestion([FromBody] AddPlacementQuestionModel model)
        {
            if (model.PlacementTestId <= 0 || string.IsNullOrEmpty(model.QuestionText))
                return BadRequest(new { message = "Invalid question data" });

            var result = await _placementRepo.AddPlacementQuestion(model);
            return Ok(result);
        }

        [HttpPut("questions/{id}")]
        public async Task<IActionResult> UpdatePlacementQuestion(int id, [FromBody] AddPlacementQuestionModel model)
        {
            var result = await _placementRepo.UpdatePlacementQuestion(id, model);
            return Ok(result);
        }

        [HttpDelete("questions/{id}")]
        public async Task<IActionResult> DeletePlacementQuestion(int id)
        {
            var result = await _placementRepo.DeletePlacementQuestion(id);
            return Ok(result);
        }

        // ==================== RESULT ====================

        [HttpPost("results")]
        public async Task<IActionResult> SavePlacementResult([FromBody] SavePlacementResultModel model)
        {
            if (model.PlacementTestId <= 0 || model.AccountId == null)
                return BadRequest(new { message = "Invalid placement result data" });

            var result = await _placementRepo.SavePlacementResult(model);
            return Ok(result);
        }

        [HttpGet("results/latest/{accountId}/{fieldId}")]
        public async Task<IActionResult> GetLatestResult(string accountId, int fieldId)
        {
            var result = await _placementRepo.GetLatestResult(accountId, fieldId);
            if (result == null)
                return NotFound(new { message = "No result found" });

            return Ok(result);
        }
    }
}
