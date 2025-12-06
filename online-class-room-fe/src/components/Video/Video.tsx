import { forwardRef, useRef, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';
import PauseIcon from '@mui/icons-material/Pause';
import { useDispatch } from 'react-redux';
import { setVideoWatched } from '../../slices/learningCourseSlice';

interface Props {
    src: string;
}

const Video = ({ src }: Props, ref: any) => {
    const dispatch = useDispatch();

    if (ref === null) {
        ref = useRef();
    }

    const [isPlay, setPlay] = useState(true);

    // Nhấn icon play / pause
    const handleOnClick = () => {
        if (isPlay) ref.current.play();
        else ref.current.pause();
    };

    // UI icon play/pause
    const handleOnVideoClick = (play: boolean) => {
        setPlay(play);
    };

    // ⬇⬇⬇ THÊM LOGIC XEM ĐỦ VIDEO
    const handleTimeUpdate = () => {
        const video = ref.current;
        if (!video) return;

        if (video.duration > 0 && video.currentTime / video.duration >= 0.9) {
            dispatch(setVideoWatched(true)); // xem >= 90%
        }
    };

    const handleEnded = () => {
        dispatch(setVideoWatched(true)); // xem xong video
    };
    // ⬆⬆⬆ END LOGIC

    return (
        <>
            <div className="relative cursor-pointer text-[50px] md:text-[80px]">
                <video
                    onPause={() => handleOnVideoClick(true)}
                    onPlay={() => handleOnVideoClick(false)}
                    onTimeUpdate={handleTimeUpdate}   // ⬅⬅ thêm
                    onEnded={handleEnded}             // ⬅⬅ thêm
                    ref={ref}
                    controls
                    width="100%"
                >
                    <source src={src} type="video/mp4" />
                    Sorry, your browser doesn't support embedded videos.
                </video>

                {/* Icon Play / Pause overlay */}
                <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] text-white">
                    {isPlay ? (
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, type: 'keyframes' }}
                        >
                            <div
                                className="flex items-center rounded-full bg-[#0000007d]"
                                onClick={handleOnClick}
                            >
                                <PlayArrowIcon style={{ fontSize: 'inherit', color: 'inherit' }} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, type: 'keyframes' }}
                        >
                            <div
                                className="flex items-center rounded-full bg-[#0000007d]"
                                onClick={handleOnClick}
                            >
                                <PauseIcon style={{ fontSize: 'inherit', color: 'inherit' }} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default forwardRef(Video);
