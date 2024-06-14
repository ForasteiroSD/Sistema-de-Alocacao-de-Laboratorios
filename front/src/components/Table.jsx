/* Packages */
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

/* Css */
import './Table.css'

export default function Table({header, data, editable, showUpdate, showDelete, updateId}) {
    return (
        <div className='Table'>
            {header && (
                <div className='grid TableHeader' style={{gridTemplateColumns: 'repeat(' + header.length + ', 1fr) .1fr'}}>
                    {header.map((value) => (
                        <p key={value} className='TableItem'>{value}</p>
                    ))}
                </div>
            )}

            {data && (
                <div className='TableData'>
                    {data.map((user, i) => (
                        <div key={i} className='grid TableLine' style={{gridTemplateColumns: 'repeat(' + (editable ? user.length-1 : user.length) + ', 1fr) .1fr'}}>
                            {user.map((info, j) => (
                                ((j > 0 && editable) || !editable) && <p key={j} className='TableItem'>{info}</p>
                            ))}
                            {editable && (
                                <div className="flex v" style={{gap: '5px'}}>
                                    <FiEdit style={{cursor: 'pointer'}} onClick={() => {updateId(user[0]); showUpdate(true); showDelete(false)}}/>
                                    <MdDeleteOutline style={{cursor: 'pointer'}} onClick={() => {updateId(user[0]); showDelete(true); showUpdate(false)}}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}