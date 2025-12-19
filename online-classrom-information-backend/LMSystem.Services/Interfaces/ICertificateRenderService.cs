using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface ICertificateRenderService
    {
        /// <summary>
        /// Render HTML certificate to PDF bytes (on-demand, no file saved)
        /// </summary>
        /// <param name="html">Full HTML content</param>
        /// <returns>PDF as byte array</returns>
        byte[] RenderPdf(string html);
    }
}
