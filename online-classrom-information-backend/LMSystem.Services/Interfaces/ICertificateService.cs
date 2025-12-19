using LMSystem.Repository.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface ICertificateService
    {
        Task<ResponeModel> IssueCertificateAsync(string accountId, int courseId);
        Task<ResponeModel> GetMyCertificatesAsync(string accountId);
    }

}
