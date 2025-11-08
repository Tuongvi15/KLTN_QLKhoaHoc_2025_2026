import { Input, Typography } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

interface MultipleQuestionInputItemProps {
    setStore: Dispatch<SetStateAction<string[]>>;
    index: number;
    placeholder?: string;
    value?: string;
    maxLength?: number;
    size?: SizeType;
    edit?: boolean;
}

const answerPrefix = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const MultipleQuestionInputItem = ({
    setStore,
    index,
    placeholder,
    value,
    maxLength,
    size = 'large',
    edit = true,
}: MultipleQuestionInputItemProps) => {
    const [data, setData] = useState(value ?? '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (data.trim() === '') {
            setError('Đáp án không được để trống');
        } else {
            setError('');
        }
    }, [data]);

    return (
        <div className={`flex flex-col gap-1 ${edit ? 'items-start' : 'items-center'}`}>
            <div className="flex items-center gap-2 w-full">
                <Typography.Title level={5} className="!mb-0">
                    {answerPrefix[index] || ''}
                </Typography.Title>
                {edit ? (
                    <Input
                        className="flex-1"
                        value={data}
                        maxLength={maxLength}
                        size={size}
                        showCount
                        allowClear
                        placeholder={placeholder}
                        status={error ? 'error' : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setData(val);
                            setStore((prev) => {
                                const arr = [...prev];
                                arr[index] = val;
                                return arr;
                            });
                        }}
                    />
                ) : (
                    <Typography.Text>{value}</Typography.Text>
                )}
            </div>
            {error && <p className="text-red-500 text-xs ml-7">{error}</p>}
        </div>
    );
};

export default MultipleQuestionInputItem;
