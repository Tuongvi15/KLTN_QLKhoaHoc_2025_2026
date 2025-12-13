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
            try
            {
                // =============================
                // Check registration
                // =============================
                var registration = await _context.RegistrationCourses
                    .FirstOrDefaultAsync(rc => rc.RegistrationId == registrationId);
                if (registration == null)
                    return new ResponeModel { Status = "Error", Message = "Registration not found" };

                // =============================
                // Check step
                // =============================
                var step = await _context.Steps
                    .FirstOrDefaultAsync(s => s.StepId == stepId);
                if (step == null)
                    return new ResponeModel { Status = "Error", Message = "Step not found" };

                // =============================
                // Tổng số step của course
                // =============================
                var totalSteps = await _context.Steps
                    .CountAsync(s => s.Section.CourseId == registration.CourseId);

                // =============================
                // Kiểm tra step đã hoàn thành chưa
                // =============================
                var stepCompleted = await _context.StepCompleteds
                    .FirstOrDefaultAsync(sc =>
                        sc.RegistrationId == registrationId &&
                        sc.StepId == stepId);

                bool isNewStepCompleted = stepCompleted == null;

                // =============================
                // Add / Update StepCompleted
                // =============================
                if (stepCompleted == null)
                {
                    stepCompleted = new StepCompleted
                    {
                        RegistrationId = registrationId,
                        StepId = stepId,
                        DateCompleted = DateTime.UtcNow
                    };
                    _context.StepCompleteds.Add(stepCompleted);
                }
                else
                {
                    stepCompleted.DateCompleted = DateTime.UtcNow;
                    _context.StepCompleteds.Update(stepCompleted);
                }

                await _context.SaveChangesAsync();

                // =============================
                // Tính lại learning progress
                // =============================
                var completedStepsCount = await _context.StepCompleteds
                    .CountAsync(sc => sc.RegistrationId == registrationId);

                if (isNewStepCompleted)
                {
                    completedStepsCount = Math.Min(completedStepsCount, totalSteps);
                }

                var learningProgress = totalSteps > 0
                    ? Math.Round((double)completedStepsCount / totalSteps, 4)
                    : 0;

                var isCompleted = completedStepsCount >= totalSteps;

                // =============================
                // Update RegistrationCourse
                // =============================
                registration.LearningProgress = learningProgress;
                registration.IsCompleted = isCompleted;

                _context.RegistrationCourses.Update(registration);
                await _context.SaveChangesAsync();

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Step completed successfully",
                    DataObject = registration
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "An error occurred while updating step completion"
                };
            }
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
