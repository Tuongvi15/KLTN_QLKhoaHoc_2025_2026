import { Tab, Tabs, styled } from '@mui/material';
import { useState } from 'react';
import { CourseCard } from '..';
import { Course } from '../../types/Course.type';
import { Skeleton } from 'antd';

interface Props {
    courseList: Course[] | undefined;
    tabsTitle: string;
    isLoading: boolean;
}

const CourseTabs = ({ courseList, tabsTitle, isLoading }: Props) => {
    const [value, setValue] = useState(0);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const StylingTab = styled(Tab)({
        textAlign: 'start',
        padding: '8px 12px',
        minHeight: 'auto',
        alignItems: 'flex-start',
        '&.Mui-selected': {
            color: 'inherit',
        },
        '&.MuiTab-root': {
            color: 'inherit',
            '&:hover': {
                backgroundColor: 'transparent !important',   // FIX CHUẨN
                boxShadow: 'none !important',
                transform: 'none !important',
            },
        },

    });

    // Hàm lấy phần trăm giảm giá từ salesCampaign
    const getDiscountPercent = (course: Course): number | null => {
        if (course.salesCampaign && course.salesCampaign > 0) {
            return Math.round(course.salesCampaign * 100);
        }
        return null;
    };

    return (
        <>
            <div className="overflow-visible">
                <style>{`
                    .MuiTab-root {
                        position: relative;
                    }
                    
                    .MuiTab-root img {
                        width: 100%;
                        height: 220px;
                        object-fit: cover;
                        border-radius: 12px;
                        display: block;
                        vertical-align: middle;
                        will-change: auto;
                        transform: translateZ(0);
                    }
                    
                    .MuiTabs-root {
                        overflow: visible;
                    }
                    
                    .MuiTabs-scroller {
                        overflow-x: auto !important;
                        overflow-y: visible !important;
                        padding: 16px 0 24px 0;
                        margin: -16px 0 -24px 0;
                        scroll-behavior: smooth;
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    .MuiTabs-flexContainer {
                        gap: 16px;
                        align-items: stretch;
                    }
                    
                    .MuiTab-root {
                        min-width: 280px;
                        max-width: 320px;
                        transform: translateZ(0);
                        backface-visibility: hidden;
                    }
                    
                    .MuiTabs-scrollButtons {
                        opacity: 0.6;
                        transition: none;
                    }
                    
                    .MuiTabs-scrollButtons:hover {
                        opacity: 1;
                    }
                    
                    .MuiTabs-scrollButtons.Mui-disabled {
                        opacity: 0.3;
                    }
                    
                    * {
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }
                    
                    .course-wrapper {
                        position: relative;
                        width: 100%;
                    }
                    
                    .sale-badge {
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 999;
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                        color: white;
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-weight: 700;
                        font-size: 13px;
                        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                        backdrop-filter: blur(8px);
                        border: 1.5px solid rgba(255, 255, 255, 0.4);
                        pointer-events: none;
                    }
                    
                    .sale-badge::before {
                        content: '🔥';
                        font-size: 11px;
                    }
                `}</style>

                {isLoading && <Skeleton active />}
                {!isLoading && courseList && (
                    <>
                        <h1 className="pl-4 text-2xl font-bold mb-4">{tabsTitle}</h1>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="tabscrollAble"
                            TabIndicatorProps={{ style: { display: 'none' } }}
                            style={{ color: 'inherit' }}
                            className="md:mx-[-40px]"
                            TabScrollButtonProps={{
                                style: {
                                    width: 40,
                                    transition: 'none',
                                }
                            }}
                        >
                            {courseList.map((course, index) => {
                                const discount = getDiscountPercent(course);

                                return (
                                    <StylingTab
                                        key={course.courseId || index}
                                        label={
                                            <div className="course-wrapper">
                                                {discount && (
                                                    <span className="sale-badge">
                                                        -{discount}%
                                                    </span>
                                                )}
                                                <CourseCard course={course} />
                                            </div>
                                        }
                                        disableRipple
                                        disableTouchRipple
                                    />
                                );
                            })}
                        </Tabs>
                    </>
                )}
            </div>
        </>
    );
};

export default CourseTabs;