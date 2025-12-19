import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Section } from '../../types/Course.type';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setStepActiveByStepId } from '../../slices/learningCourseSlice';

export interface AccordionSectionProps {
    sections: Section[];
    completedStepIds: number[];
    currentStepId: number;
}

const AccordionSection = ({
    sections,
    completedStepIds,
    currentStepId,
}: AccordionSectionProps) => {
    const dispatch = useDispatch();
    const selectingStepId = useSelector(
        (state: RootState) => state.learningCourse.stepActive.stepId
    );

    return (
        <div>
            {sections.map((section, sectionIndex) => (
                <Accordion key={sectionIndex}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            {section.position} - {section.title}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        {section.steps.map((step) => {
                            const unlocked =
                                completedStepIds.includes(step.stepId) ||
                                step.stepId === currentStepId;

                            return (
                                <div
                                    key={step.stepId}
                                    onClick={() =>
                                        unlocked &&
                                        selectingStepId !== step.stepId &&
                                        dispatch(setStepActiveByStepId(step.stepId))
                                    }
                                    className={`
                                        flex justify-between py-3 px-4 text-sm
                                        ${selectingStepId === step.stepId ? 'bg-[#edf5fb]' : ''}
                                        ${unlocked
                                            ? 'cursor-pointer hover:bg-[#edf5fb]'
                                            : 'cursor-not-allowed text-[#c6c6c6]'
                                        }
                                    `}
                                >
                                    <span>
                                        {step.position}. {step.title}
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
