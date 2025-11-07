import { Layout } from 'antd';
import ParentHeader from './ParentHeader';
import ParentContent from './ParentContent';
import ParentFooter from './ParentFooter';

const DefaultParentLayout = ({ children  }: { children : React.ReactNode }) => {
    return (
        <>
            <Layout className="min-h-screen">
                <Layout className="bg-[#f0f2f5] ">
                    <ParentHeader />
                    <ParentContent children={children } />
                    <ParentFooter />
                </Layout>
            </Layout>
        </>
    );
};

export default DefaultParentLayout;
