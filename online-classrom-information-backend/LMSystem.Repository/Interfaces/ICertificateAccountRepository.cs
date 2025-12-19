using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface ICertificateAccountRepository
    {
        Task<bool> ExistsAsync(string accountId, int courseId);
        Task<CertificateAccount?> GetByAccountAndCourseAsync(
     string accountId,
     int courseId
 );
        Task<CertificateAccount?> GetByIdAsync(int certificateId);
        Task<IEnumerable<CertificateAccount>> GetByAccountAsync(string accountId);
        Task<CertificateAccount> CreateAsync(CertificateAccount cert);
    }

}
