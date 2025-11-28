import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Container } from '@mui/material';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const socialLinks = [
        { icon: FacebookIcon, href: '#', color: 'hover:text-blue-500', bg: 'hover:bg-blue-500/20' },
        { icon: InstagramIcon, href: '#', color: 'hover:text-pink-500', bg: 'hover:bg-pink-500/20' },
        { icon: TwitterIcon, href: '#', color: 'hover:text-sky-500', bg: 'hover:bg-sky-500/20' },
        { icon: YouTubeIcon, href: '#', color: 'hover:text-red-500', bg: 'hover:bg-red-500/20' },
    ];

    const footerSections = [
        {
            title: 'Về eStudyHub',
            links: [
                'Mô tả khóa học',
                'Quan hệ với nhà đầu tư',
                'Thông báo pháp lí',
                'Về chúng tôi',
                'Tầm nhìn & Sứ mệnh'
            ]
        },
        {
            title: 'Hỗ trợ',
            links: [
                'Trung tâm trợ giúp',
                'Việc làm',
                'Tùy chọn cookie',
                'FAQ',
                'Hướng dẫn sử dụng'
            ]
        },
        {
            title: 'Dịch vụ',
            links: [
                'Thẻ quà tặng',
                'Điều khoản sử dụng',
                'Thông tin doanh nghiệp',
                'Đối tác',
                'API Developer'
            ]
        },
        {
            title: 'Liên hệ',
            links: [
                'Trung tâm đa phương tiện',
                'Quyền riêng tư',
                'Liên hệ với chúng tôi',
                'Feedback',
                'Báo cáo lỗi'
            ]
        }
    ];

    return (
        <footer className="relative mt-16 bg-gray-900 border-t border-gray-800">
            <Container maxWidth="xl">
                <div className="py-12">
                    {/* Main Footer Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center mb-4">
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                                    <SchoolIcon
                                        className="text-2xl"
                                        style={{ color: "#00497cff" }}
                                    />
                                </div>
                                <h2 className="ml-2 text-2xl font-bold text-white">eStudyHub</h2>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Nền tảng học tập trực tuyến hàng đầu
                            </p>

                            {/* Social Links */}
                            <div className="flex space-x-2">
                                {socialLinks.map((social, index) => {
                                    const IconComponent = social.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={social.href}
                                            className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} hover:bg-gray-700 transition-all duration-200`}
                                        >
                                            <IconComponent className="text-lg" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Links Sections */}
                        {footerSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-sm font-semibold text-white mb-3">
                                    {section.title}
                                </h3>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a
                                                href="#"
                                                className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-gray-500">
                            © 2025 eStudyHub. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;