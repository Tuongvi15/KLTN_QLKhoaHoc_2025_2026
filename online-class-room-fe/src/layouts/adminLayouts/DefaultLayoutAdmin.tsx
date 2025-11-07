import { Layout } from 'antd';
import MySider from './Nav/Sider';
import MyHeader from './Nav/HeaderAdmin';
import MyContent from './Nav/ContentAdmin';
import MyFooter from './Nav/FooterAdmin';

const DefaultLayoutAdmin = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout className="min-h-screen">
            <MySider />
            <Layout className="bg-white">
                <MyHeader />
                <MyContent>{children}</MyContent>
                <MyFooter />
            </Layout>
        </Layout>
    );
};

export default DefaultLayoutAdmin;
