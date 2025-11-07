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
        { icon: LinkedInIcon, href: '#', color: 'hover:text-blue-600', bg: 'hover:bg-blue-600/20' },
        { icon: TelegramIcon, href: '#', color: 'hover:text-sky-400', bg: 'hover:bg-sky-400/20' },
    ];

    const footerSections = [
        {
            title: 'Về StudyHub',
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
        <footer className="relative mt-16 overflow-hidden">
            {/* Background with gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />
            
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl" />
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl" />
            </div>

            <Container maxWidth="xl" className="relative">
                {/* Main Footer Content */}
                <div className="py-16">
                    {/* Top Section with Logo and CTA */}
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl">
                                    <SchoolIcon className="text-white text-3xl" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-4xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                    StudyHub
                                </h2>
                                <p className="text-gray-400 font-semibold -mt-1">Learning Platform</p>
                            </div>
                        </div>
                        
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                            Nền tảng học tập trực tuyến hàng đầu với hàng nghìn khóa học chất lượng cao. 
                            Cùng chúng tôi khám phá kiến thức và phát triển kỹ năng cho tương lai.
                        </p>

                        {/* Social Media Links */}
                        <div className="flex justify-center space-x-4 mb-12">
                            {socialLinks.map((social, index) => {
                                const IconComponent = social.icon;
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className={`w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-400 ${social.color} ${social.bg} transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                                    >
                                        <IconComponent className="text-2xl group-hover:scale-110 transition-transform duration-300" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {footerSections.map((section, index) => (
                            <div key={index} className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4 relative">
                                    {section.title}
                                    <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                                </h3>
                                <ul className="space-y-3">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a
                                                href="#"
                                                className="text-gray-400 hover:text-white transition-all duration-300 hover:pl-2 relative group"
                                            >
                                                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-4 transition-all duration-300" />
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>

            {/* Animated Bottom Border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        </footer>
    );
};

export default Footer;