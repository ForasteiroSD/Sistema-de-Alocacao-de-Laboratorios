import './Table.css'

export default function Table({header, usersData}) {
    return (
        <div className='Table'>
            {header && (
                <div className='grid TableHeader' style={{gridTemplateColumns: 'repeat(' + header.length + ', 1fr)'}}>
                    {header.map((value) => (
                        <p key={value} className='TableItem'>{value}</p>
                    ))}
                </div>
            )}

            {usersData && (
                <div className='TableData'>
                    {usersData.map((user, i) => (
                        <div key={i} className='grid TableLine' style={{gridTemplateColumns: 'repeat(' + user.length + ', 1fr)'}}>
                            {user.map((info, j) => (
                                <p key={j} className='TableItem'>{info}</p>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}