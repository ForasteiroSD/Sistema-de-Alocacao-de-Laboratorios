/* Css */
import './NextReserves.css'

export default function NextReserves({name, date, begin, duration}) {
  return (
    <div className='flex v c NextReserves'>
        <h3>{name}</h3>
        <p>{date}</p>
        <div className="flex" style={{width: '100%', justifyContent: 'space-around'}}>
            <p>Entrada: {begin}</p>
            <p>Duração: {duration}</p>
        </div>
    </div>
  )
}