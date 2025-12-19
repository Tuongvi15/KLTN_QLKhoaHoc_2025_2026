using DinkToPdf.Contracts;
using DinkToPdf;
using LMSystem.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Services
{
    public class CertificateRenderService : ICertificateRenderService
    {
        private readonly IConverter _converter;

        public CertificateRenderService(IConverter converter)
        {
            _converter = converter;
        }

        public byte[] RenderPdf(string html)
        {
            var doc = new HtmlToPdfDocument
            {
                GlobalSettings =
                {
                    PaperSize = PaperKind.A4,
                    Orientation = Orientation.Landscape,
                    DPI = 300,
                    Margins = new MarginSettings { Top = 0, Bottom = 0, Left = 0, Right = 0 }
                },
                Objects =
                {
                    new ObjectSettings
                    {
                        HtmlContent = html,
                        WebSettings =
                        {
                            DefaultEncoding = "utf-8",
                            LoadImages = true,
                            EnableJavascript = true
                        }
                    }
                }
            };

            return _converter.Convert(doc);
        }
    }
}
