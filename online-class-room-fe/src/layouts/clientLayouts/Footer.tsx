import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Container } from '@mui/material';

const Footer = () => {

    const socialLinks = [
        { icon: FacebookIcon, href: '#', color: 'hover:text-blue-500' },
        { icon: InstagramIcon, href: '#', color: 'hover:text-pink-500' },
        { icon: TwitterIcon, href: '#', color: 'hover:text-sky-500' },
        { icon: YouTubeIcon, href: '#', color: 'hover:text-red-500' },
    ];

    const footerSections = [
        {
            title: 'Giới thiệu',
            links: ['Về chúng tôi', 'Tầm nhìn', 'Đội ngũ']
        },
        {
            title: 'Hỗ trợ',
            links: ['FAQ', 'Liên hệ', 'Hướng dẫn']
        }
    ];

    return (
        <footer className="mt-16 bg-gray-900 border-t border-gray-800">
            <Container maxWidth="lg">
                <div className="py-10">

                    {/* Main */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                        {/* Brand */}
                        <div>
                            <div className="flex items-center mb-3">
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                                    <SchoolIcon className="text-white" />
                                </div>
                                <h2 className="ml-2 text-xl font-bold text-white">
                                    eStudyHub
                                </h2>
                            </div>

                            <p className="text-sm text-gray-400 mb-3">
                                Nền tảng học tập trực tuyến cho sinh viên
                            </p>

                            <div className="flex space-x-2">
                                {socialLinks.map((social, i) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={i}
                                            href={social.href}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 ${social.color} hover:bg-gray-700 transition`}
                                        >
                                            <Icon fontSize="small" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Links */}
                        {footerSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-sm font-semibold text-white mb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1">
                                    {section.links.map((link, i) => (
                                        <li key={i}>
                                            <a
                                                href="#"
                                                className="text-sm text-gray-400 hover:text-purple-400 transition"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                    </div>

                    {/* Bottom */}
                    <div className="pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
                        © 2025 eStudyHub · Trường Đại học Công nghiệp TP. Hồ Chí Minh
                    </div>

                </div>
            </Container>
        </footer>
    );
};

export default Footer;
