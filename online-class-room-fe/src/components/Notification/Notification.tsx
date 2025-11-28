import { Badge, Popover } from 'antd';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationPopover from './NotificationPopover';
import { IconButton } from '@mui/material';
import { useGetNumberOfUnreadNotificationsQuery } from '../../services/notification.services';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';

const Notification = () => {
    const accountId = useSelector((state: RootState) => state.user.id);
    const { data, refetch } = useGetNumberOfUnreadNotificationsQuery(accountId ? accountId : '');
    return (
        <>
            <Popover
                content={
                    <NotificationPopover
                        onMakeIsReadNoti={() => {
                            refetch();
                        }}
                    />
                }
                trigger="hover"
                placement="bottomRight"
            >
                <IconButton
                    sx={{ 
                        color: '#1c1d1f',
                        '&:hover': { bgcolor: '#f7f9fa', color: '#5624d0' }
                    }}
                >
                    <Badge 
                        count={data ? data : 0}
                        className="[&_.ant-badge-count]:!bg-[#ec5252] [&_.ant-badge-count]:!border-none [&_.ant-badge-count]:!min-w-[18px] [&_.ant-badge-count]:!h-[18px] [&_.ant-badge-count]:!text-[11px] [&_.ant-badge-count]:!leading-[18px]"
                    >
                        <NotificationsNoneIcon sx={{ fontSize: 24 }} />
                    </Badge>
                </IconButton>
            </Popover>
        </>
    );
};

export default Notification;