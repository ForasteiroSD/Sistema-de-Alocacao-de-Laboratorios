/* Packages */
import { FiEdit } from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";

/* Css */
import './Table.css'

export default function Table({header, data, editable, showUpdate, showExclude, Id}) {
    return (
        <div className='Table'>
            {header && (
                <div className='grid TableHeader' style={{gridTemplateColumns: 'repeat(' + header.length + ', 1fr) ' + (editable ? '69px' : '')}}>
                    {header.map((value) => (
                        <p key={value} className='TableItem'>{value}</p>
                    ))}
                </div>
            )}

            {data && (
                <div className='TableData'>
                    {data.map((line, i) => (
                        // <div key={i} className='grid TableLine' style={{gridTemplateColumns: 'repeat(' + (editable ? line.length-1 : line.length) + ', 1fr) .1fr'}}>
                        <div key={i} className='grid TableLine' style={{gridTemplateColumns: 'repeat(' + (editable ? line.length-1 : line.length) + ', 1fr) ' + (editable ? 'auto': '')}}>
                            {line.map((item, j) => (
                                ((j > 0 && editable) || !editable) && <p key={j} className='TableItem'>{item}</p>
                            ))}
                            {editable && (
                            <div className="flex v" style={{gap: '.6rem', margin: '0 .6rem'}}>
                                <FiEdit className="Icons" style={{cursor: 'pointer'}} onClick={() => {Id(line[0]); showUpdate(true)}}/>
                                <IoTrashOutline className="Icons" style={{width: '1.3rem', height: '1.3rem', cursor: 'pointer'}} onClick={() => {Id(line[0]); showExclude(true)}} />
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}