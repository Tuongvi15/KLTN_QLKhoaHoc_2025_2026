import { Carousel } from 'antd';

const images = [
    'https://frontends.udemycdn.com/components/auth/desktop-illustration-step-2-x2.webp',
];
const MyCarouselLogin = () => {
    return (
        <Carousel>
            {images.map((imageUrl, index) => (
                <div key={index} className="h-screen">
                    <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="mx-auto h-full object-cover "
                    />
                </div>
            ))}
        </Carousel>
    );
};

export default MyCarouselLogin;
