using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Data
{
    public enum ReportStatus
    {
        Pending,
        Done
    }

    public enum RequestType
    {
        RequestAnAccountForParents,
        CourseReport,
        AccountReport,
        Other
    }
}
