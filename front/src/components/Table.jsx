/* Packages */
import { FiEdit } from "react-icons/fi";

/* Css */
import './Table.css'

export default function Table({header, usersData, editable}) {
    return (
        <div className='Table'>
            {header && (
                <div className='grid TableHeader' style={{gridTemplateColumns: 'repeat(' + header.length + ', 1fr) .1fr'}}>
                    {header.map((value) => (
                        <p key={value} className='TableItem'>{value}</p>
                    ))}
                </div>
            )}

            {usersData && (
                <div className='TableData'>
                    {usersData.map((user, i) => (
                        <div key={i} className='grid TableLine' style={{gridTemplateColumns: 'repeat(' + user.length + ', 1fr) .1fr'}}>
                            {user.map((info, j) => (
                                <p key={j} className='TableItem'>{info}</p>
                            ))}
                            {editable && (
                                <div className="flex v">
                                    <FiEdit style={{cursor: 'pointer'}}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}