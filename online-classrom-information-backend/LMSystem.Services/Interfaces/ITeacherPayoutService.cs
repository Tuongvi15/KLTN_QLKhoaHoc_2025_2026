using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface ITeacherPayoutService
    {
        Task GeneratePayout(int month, int year);
    }

}
