import React from 'react';
import { IoIosExpand } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Table.css';

export default function Table({ header, data, editable, expandable, deletable, showUpdate, showExclude, Id, handleExpand }) {

    const handleExpandClick = (id) => {
        if (handleExpand) {
            handleExpand(id);
        }
    };

    return (
        <div className='Table'>
            {header && (
                <div className='grid TableHeader' style={{ gridTemplateColumns: `repeat(${header.length}, 1fr) ${(editable || expandable) && deletable ? '69px' : (editable || expandable) && !deletable ? '39px' : ''}` }}>
                    {header.map((value, index) => (
                        <p key={index} className='TableItem'>{value}</p>
                    ))}
                </div>
            )}

            {data && (
                <div className='TableData'>
                    {data.map((line, i) => (
                        <div key={i} className='grid TableLine' style={{ gridTemplateColumns: `repeat(${editable || expandable ? line.length - 1 : line.length}, 1fr) ${(editable || expandable) ? 'auto' : ''}` }}>
                            {line.map((item, j) => (
                                (j > 0 && (editable || expandable)) || (!editable && !expandable) ? (
                                    <p key={j} className='TableItem'>{item}</p>
                                ) : null
                            ))}
                            {editable && (
                                <div className="flex v" style={{ gap: '.6rem', margin: '0 .6rem' }}>
                                    <FiEdit className="Icons" style={{ cursor: 'pointer' }} onClick={() => { Id(line[0]); showUpdate(true) }} />
                                    {deletable && <IoTrashOutline className="Icons" style={{ width: '1.3rem', height: '1.3rem', cursor: 'pointer' }} onClick={() => { Id(line[0]); showExclude(true) }} />}
                                </div>
                            )}
                            {expandable && (
                                <div className="flex v" style={{ gap: '.6rem', margin: '0 .6rem' }}>
                                    <IoIosExpand className="Icons" style={{ cursor: 'pointer' }} onClick={() => { Id && Id(line[0]); handleExpandClick(line[0])}} />
                                    {deletable && <IoTrashOutline className="Icons" style={{ width: '1.3rem', height: '1.3rem', cursor: 'pointer' }} onClick={() => { Id(line[0]); showExclude(true) }} />}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
