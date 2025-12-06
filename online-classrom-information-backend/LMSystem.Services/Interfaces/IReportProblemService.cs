using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface IReportProblemService
    {
        Task<ReportDetailDto?> GetReportDetail(int reportId);
        Task<ReportProblem> SendRequestAsync(SendRequestModel model);
        Task<PagedList<ReportProblemListDto>> GetAllReportProblem(PaginationParameter paginationParameter);
        Task<ResponeModel> ResolveRequestAsync(ResolveRequestModel model);
    }
}
