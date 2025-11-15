import { useEffect, useState } from 'react';
import { MultipleInputItem } from '..';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { SizeType } from 'antd/es/config-provider/SizeContext';

interface MultipleInputProps {
    placeholders?: string[];
    onDataChange: (data: string) => void;
    seperator: string;
    values: string;
    maxInputItem: number;
    maxLengthInput?: number;
    size?: SizeType;
}

const MultipleInput = ({
    onDataChange,
    placeholders,
    seperator,
    values,
    maxInputItem,
    maxLengthInput = 60,
    size,
}: MultipleInputProps) => {
    const [arr, setArr] = useState<string[]>(
        values.split(seperator).filter((value) => value !== ''),
    );
    const [currentNum, setCurrentNum] = useState(arr.length);

    useEffect(() => {
        let dataString = '';
        arr.forEach((data) => {
            if (data !== '') {
                dataString += data + seperator;
            }
        });
        onDataChange(dataString);
    }, [arr]);

    const handleOnAddClick = () => {
        if (currentNum < maxInputItem) {
            setCurrentNum(currentNum + 1);
        }
    };

    // ✅ Hàm xoá 1 mục
    const handleRemove = (indexToRemove: number) => {
        const next = arr.filter((_, i) => i !== indexToRemove);
        setArr(next);
        setCurrentNum(next.length);
    };

    return (
        <div>
            <div className="flex flex-col gap-4">
                {Array.from({ length: currentNum }, (_, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <MultipleInputItem
                            maxLength={maxLengthInput}
                            value={arr[index] ? arr[index] : ''}
                            setStore={setArr}
                            index={index}
                            placeholder={placeholders?.[index]}
                            size={size}
                        />

                        {/* 🔥 Nút xoá */}
                        <IconButton
                            onClick={() => handleRemove(index)}
                            size="small"
                            color="error"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </div>
                ))}

                {currentNum < maxInputItem && (
                    <Button
                        onClick={handleOnAddClick}
                        className="!w-fit justify-start"
                        variant="outlined"
                        startIcon={<AddIcon />}
                    >
                        Thêm mục mới
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MultipleInput;
