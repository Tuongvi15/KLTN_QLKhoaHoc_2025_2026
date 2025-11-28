import { List, Typography, Empty } from 'antd';
import { useSelector } from 'react-redux';
import {
    useGetAllNotificationsQuery,
    useMakeNotificationIsReadMutation,
} from '../../services/notification.services';
import { RootState } from '../../store';
import moment from 'moment/min/moment-with-locales';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface NotificationPopoverProps {
    onMakeIsReadNoti: () => void;
}

const NotificationPopover = ({ onMakeIsReadNoti }: NotificationPopoverProps) => {
    const accountId = useSelector((state: RootState) => state.user.id);
    const { data, isLoading, refetch } = useGetAllNotificationsQuery({
        accountId: accountId ? accountId : '',
        pageNumber: 1,
        pageSize: 30,
    });
    const [makeIsReadNoti, { isSuccess }] = useMakeNotificationIsReadMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            onMakeIsReadNoti();
            refetch();
        }
    }, [isSuccess]);

    const handleOnClickFavorite = async (id: number, modelId: number, type: string) => {
        if (type.includes('Course')) {
            navigate(`/courses/${modelId}`);
        } else {
            navigate(`#`);
        }
    };

    return (
        <div className="w-[420px] bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-[#1c1d1f] m-0">Thông báo</h3>
            </div>

            {/* Notification List */}
            <div className="max-h-[480px] overflow-auto">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded mb-3"></div>
                            <div className="h-16 bg-gray-200 rounded mb-3"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="p-8">
                        <Empty 
                            description="Không có thông báo mới"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    <List
                        dataSource={data}
                        renderItem={(item) => (
                            <div
                                className={`relative px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-[#f7f9fa] ${
                                    !item.isRead ? 'bg-[#fff4e6]' : ''
                                }`}
                                onClick={() => {
                                    if (!item.isRead) makeIsReadNoti(item.notificationId);
                                    handleOnClickFavorite(item.notificationId, item.modelId, item.type);
                                }}
                            >
                                <div className="flex gap-3">
                                    {/* Icon/Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <img
                                                className="w-8 h-8 object-contain"
                                                src="https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Fe-black.png?alt=media&token=a0a401b9-6d20-4597-833c-962457c543ac"
                                                alt="notification"
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Title */}
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-[#1c1d1f] m-0 line-clamp-1">
                                                {item.title}
                                            </h4>
                                            {!item.isRead && (
                                                <CircleIcon 
                                                    sx={{ 
                                                        fontSize: 10, 
                                                        color: '#5624d0',
                                                        flexShrink: 0
                                                    }} 
                                                />
                                            )}
                                        </div>

                                        {/* Message */}
                                        <p className="text-sm text-[#1c1d1f] m-0 mb-2">
                                            <span className="font-semibold text-[#5624d0]">{item.action}</span>
                                            {' '}{item.message}
                                        </p>

                                        {/* Time */}
                                        <div className="flex items-center gap-1 text-xs text-[#6a6f73]">
                                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                                            <span>{moment(item.sendDate).locale('vi').fromNow()}</span>
                                            <span>•</span>
                                            <span>{moment(item.sendDate).locale('vi').format('DD/MM/YYYY HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Footer */}
            {data && data.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 text-center">
                    <button 
                        className="text-sm font-bold text-[#5624d0] hover:text-[#401b9c] transition-colors"
                        onClick={() => navigate('/notifications')}
                    >
                        Xem tất cả thông báo
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPopover;