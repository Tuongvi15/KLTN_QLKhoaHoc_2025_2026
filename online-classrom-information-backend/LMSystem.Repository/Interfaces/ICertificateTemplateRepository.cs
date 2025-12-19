using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface ICertificateTemplateRepository
    {
        Task<CertificateTemplate?> GetByIdAsync(int id);
        Task<CertificateTemplate?> GetByCourseIdAsync(int courseId);
        Task<IEnumerable<CertificateTemplate>> GetAllAsync();
        Task<CertificateTemplate> CreateAsync(CertificateTemplate template);
        Task<CertificateTemplate> UpdateAsync(CertificateTemplate template);
        Task<bool> DeleteAsync(int templateId);
    }
}
