using LMSystem.Repository.Data;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Services.Interfaces;

public class StepCompletedService : IStepCompletedService
{
    private readonly IStepCompletedRepository _stepCompletedRepository;
    private readonly ICertificateService _certificateService;

    public StepCompletedService(
        IStepCompletedRepository stepCompletedRepository,
        ICertificateService certificateService)
    {
        _stepCompletedRepository = stepCompletedRepository;
        _certificateService = certificateService;
    }

    public async Task<ResponeModel> AddOrUpdateStepCompleted(int registrationId, int stepId)
    {
        var result = await _stepCompletedRepository.AddOrUpdateStepCompleted(registrationId, stepId);

        if (result.Status != "Success")
            return result;

        var registration = result.DataObject as RegistrationCourse;
        if (registration == null)
            return result;

        if (registration.IsCompleted == true)
        {
            await _certificateService.IssueCertificateAsync(
                registration.AccountId,
                registration.CourseId
            );
        }

        return result;
    }

    public async Task<ResponeModel> GetStepIdByRegistrationId(int registrationId)
    {
        return await _stepCompletedRepository.GetStepIdByRegistrationId(registrationId);
    }
}
