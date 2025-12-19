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
    public class CertificateTemplateRepository : ICertificateTemplateRepository
    {
        private readonly LMOnlineSystemDbContext _db;

        public CertificateTemplateRepository(LMOnlineSystemDbContext db)
        {
            _db = db;
        }

        public async Task<CertificateTemplate?> GetByIdAsync(int id)
        {
            return await _db.CertificateTemplates.FirstOrDefaultAsync(t => t.TemplateId == id);
        }

        public async Task<CertificateTemplate?> GetByCourseIdAsync(int courseId)
        {
            return await _db.CertificateTemplates
                .FirstOrDefaultAsync(t => t.CourseId == courseId);
        }

        public async Task<IEnumerable<CertificateTemplate>> GetAllAsync()
        {
            return await _db.CertificateTemplates.ToListAsync();
        }

        public async Task<CertificateTemplate> CreateAsync(CertificateTemplate template)
        {
            _db.CertificateTemplates.Add(template);
            await _db.SaveChangesAsync();
            return template;
        }

        public async Task<CertificateTemplate> UpdateAsync(CertificateTemplate template)
        {
            _db.CertificateTemplates.Update(template);
            await _db.SaveChangesAsync();
            return template;
        }

        public async Task<bool> DeleteAsync(int templateId)
        {
            var t = await _db.CertificateTemplates.FindAsync(templateId);
            if (t == null) return false;

            _db.CertificateTemplates.Remove(t);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
