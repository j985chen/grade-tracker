import React, { useEffect, useMemo, useState } from 'react';
import { useTable } from 'react-table';

import './components.css';

const EditableCell = ({
    value: initialValue,
    dataUpdated
}) => {
    const [value, setValue] = useState(initialValue);
    
    const onChange = e => {
        setValue(e.target.value)
    };

    const onBlur = () => {
        if (value !== initialValue) {
            initialValue = value;
            dataUpdated();
        }
    };

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue]);

    return <input value={value} onChange={onChange} onBlur={onBlur} />
}

const defaultColumn = {
    Cell: EditableCell,
};

export default function GradeTable({ data, dataUpdated }) {
    const columns = useMemo(
        () => [
            {
                Header: "Grade",
                accessor: "grade"
            },
            {
                Header: "Weight (out of 100%)",
                accessor: "weight"
            },
            {
                Header: "Weighted grade",
                accessor: "weightedGrade"
            }
        ],
        []
    )

    const {
        getTableProps, 
        getTableBodyProps,
        headers,
        rows, 
        prepareRow
    } = useTable({ columns, data, defaultColumn, dataUpdated });

    return(
        <table {...getTableProps()}>
            <thead>
                <tr>
                    {
                        headers.map(column => (
                            <th {...column.getHeaderProps()}>
                                { column.render('Header') }
                            </th>
                        ))
                    }
                </tr>
            </thead>
            <tbody {...getTableBodyProps()}>
                {
                    rows.map(row => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {
                                    row.cells.map(cell => {
                                        return (
                                            <td {...cell.getCellProps()}>
                                                { cell.render('Cell') } 
                                            </td>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    );
}
        