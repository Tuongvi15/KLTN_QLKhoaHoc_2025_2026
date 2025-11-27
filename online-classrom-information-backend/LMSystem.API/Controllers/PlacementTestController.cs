using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Repositories;
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

        // ==================== REMOVED FIELD API ====================
        // All field-related endpoints have been removed.

        // ==================== PLACEMENT TEST ====================

        [HttpGet("results/suggestion/{accountId}")]
        public async Task<IActionResult> GetPlacementSuggestion(string accountId)
        {
            var result = await _placementRepo.GetLatestResultByAccount(accountId);
            if (result == null)
                return NotFound(new { message = "No result found" });

            return Ok(result);
        }

        [HttpGet("results/suggestion-by-result/{resultId}")]
        public async Task<IActionResult> GetSuggestionByResult(int resultId)
        {
            var data = await _placementRepo.GetSuggestionByResult(resultId);

            if (data == null)
                return NotFound();

            return Ok(data);
        }


        [HttpGet("tests")]
        public async Task<IActionResult> GetAllPlacementTests()
        {
            var result = await _placementRepo.GetAllPlacementTests();
            return Ok(result);
        }

        [HttpGet("tests/category/{categoryId}")]
        public async Task<IActionResult> GetTestsByCategory(int categoryId, [FromQuery] string accountId)
        {
            var result = await _placementRepo.GetPlacementTestsByCategory(categoryId, accountId);
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
            if (string.IsNullOrWhiteSpace(model.Title))
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
            if (model.PlacementTestId <= 0 || string.IsNullOrWhiteSpace(model.QuestionText))
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
            if (model.PlacementTestId <= 0 || string.IsNullOrWhiteSpace(model.AccountId))
                return BadRequest(new { message = "Invalid placement result data" });

            var result = await _placementRepo.SavePlacementResult(model);
            return Ok(result);
        }

        [HttpGet("results/latest/{accountId}/{categoryId}")]
        public async Task<IActionResult> GetLatestResult(string accountId, int categoryId)
        {
            var result = await _placementRepo.GetLatestResult(accountId, categoryId);
            if (result == null)
                return NotFound(new { message = "No result found" });

            return Ok(result);
        }

        [HttpGet("results/latest/{accountId}")]
        public async Task<IActionResult> GetLatestResultByAccountId(string accountId)
        {
            var result = await _placementRepo.GetLatestResultByAccount(accountId);
            if (result == null)
                return NotFound(new { message = "No result found" });

            return Ok(result);
        }

        [HttpGet("results/history/{accountId}")]
        public async Task<IActionResult> GetAllResultsByAccount(string accountId)
        {
            var results = await _placementRepo.GetAllResultsByAccount(accountId);
            if (results == null || !results.Any())
                return NotFound(new { message = "No history found" });

            return Ok(results);
        }

    }
}