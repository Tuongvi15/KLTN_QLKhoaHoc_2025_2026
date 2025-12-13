import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Section, Step } from '../../types/Course.type';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormatType, secondsToTimeString } from '../../utils/TimeFormater';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setStepActive } from '../../slices/learningCourseSlice';

export interface AccordionSectionProps {
    sections: Section[];
    lastPosition: number;   // lastStepCompleted (stepId)
}

const AccordionSection = ({ sections, lastPosition }: AccordionSectionProps) => {
    const dispatch = useDispatch();

    const selectingStepId = useSelector(
        (state: RootState) => state.learningCourse.stepActive.stepId
    );

    const handleOnStepClick = (step: Step, sectionIndex: number, stepIndex: number) => {
        // chỉ cho click vào các step mà user đã unlock
        if (step.stepId <= lastPosition && selectingStepId !== step.stepId) {
            dispatch(setStepActive({ sectionIndex, stepIndex }));
        }
    };

    return (
        <div>
            {sections.map((section, sectionIndex) => (
                <Accordion key={sectionIndex} className="!bg-[#ffffff]">
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className="!px-8"
                    >
                        <Typography className="!text-[15px] !font-medium !text-[#1C2025]">
                            {section.position} - {section.title}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails className="!bg-white !p-0">
                        {section.steps.map((step, stepIndex) => {
                            const unlocked =
                                step.stepId <= lastPosition || step.stepId === selectingStepId;


                            return (
                                <div
                                    key={step.stepId}
                                    onClick={() => unlocked && handleOnStepClick(step, sectionIndex, stepIndex)}
                                    className={`
                                        flex select-none justify-between py-4 pl-12 pr-8 text-sm
                                        ${selectingStepId === step.stepId ? 'bg-[#edf5fb]' : ''}
                                        ${unlocked ? 'cursor-pointer hover:bg-[#edf5fb]' : 'cursor-not-allowed text-[#c6c6c6]'}
                                    `}
                                >
                                    <span>
                                        {step.position}. {step.title}
                                    </span>

                                    <span className="min-w-11">
                                        {secondsToTimeString(step.duration, FormatType.MM_SS, [' m', ' s'])}
                                    </span>
                                </div>
                            );
                        })}
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default AccordionSection;
