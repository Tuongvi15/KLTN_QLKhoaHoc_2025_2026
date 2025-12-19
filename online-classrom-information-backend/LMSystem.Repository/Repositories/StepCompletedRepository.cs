using LMSystem.Repository.Data;
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
    public class StepCompletedRepository : IStepCompletedRepository
    {
        private readonly LMOnlineSystemDbContext _context;

        public StepCompletedRepository(LMOnlineSystemDbContext context)
        {
            _context = context;
        }

        public async Task<ResponeModel> AddOrUpdateStepCompleted(int registrationId, int stepId)
        {
            var registration = await _context.RegistrationCourses
                .FirstOrDefaultAsync(r => r.RegistrationId == registrationId);

            if (registration == null)
                return new ResponeModel { Status = "Error", Message = "Registration not found" };

            var step = await _context.Steps
                .Include(s => s.Section)
                .FirstOrDefaultAsync(s => s.StepId == stepId);

            if (step == null)
                return new ResponeModel { Status = "Error", Message = "Step not found" };

            // ✅ KHÔNG overwrite – mỗi step là 1 record
            bool existed = await _context.StepCompleteds.AnyAsync(sc =>
                sc.RegistrationId == registrationId && sc.StepId == stepId);

            if (!existed)
            {
                _context.StepCompleteds.Add(new StepCompleted
                {
                    RegistrationId = registrationId,
                    StepId = stepId,
                    DateCompleted = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            // =============================
            // TÍNH PROGRESS
            // =============================
            var totalSteps = await _context.Steps
                .CountAsync(s => s.Section.CourseId == registration.CourseId);

            var completedSteps = await _context.StepCompleteds
                .Where(sc => sc.RegistrationId == registrationId)
                .Select(sc => sc.StepId)
                .Distinct()
                .CountAsync();

            registration.LearningProgress =
                totalSteps == 0 ? 0 : Math.Round((double)completedSteps / totalSteps, 4);

            registration.IsCompleted = completedSteps == totalSteps;

            _context.RegistrationCourses.Update(registration);
            await _context.SaveChangesAsync();

            return new ResponeModel
            {
                Status = "Success",
                Message = "Step completed successfully",
                DataObject = registration
            };
        }




        public async Task<ResponeModel> GetStepIdByRegistrationId(int registrationId)
        {
            try
            {
                var stepId = await _context.StepCompleteds
                    .Where(s => s.RegistrationId == registrationId)
                    .Select(s => s.StepId)
                    .FirstOrDefaultAsync();

                // Nếu chưa học bài nào -> stepId = null
                if (stepId == 0)
                {
                    return new ResponeModel
                    {
                        Status = "Success",
                        Message = "User has not completed any step yet",
                        DataObject = new { stepId = (int?)null }
                    };
                }

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Get step id successfully",
                    DataObject = new { stepId }
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "Error getting stepId"
                };
            }
        }

    }
}
