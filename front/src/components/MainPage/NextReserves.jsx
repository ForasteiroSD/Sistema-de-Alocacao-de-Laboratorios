/* Css */
import './NextReserves.css'

export default function NextReserves({ name, date, begin, duration, notFound }) {
  return (
    <div className='flex v c NextReserves'>
      {!notFound ?
        <>
          <h3>{name}</h3>
          <p>{date}</p>
          <div className="flex" style={{ width: '100%', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <p>Entrada: {begin}</p>
            <p>Duração: {duration}</p>
          </div>
        </>
        :
        <>
          <h3>Laboratório não reservado</h3>
          <div className='flex v' style={{ height: '100%'}}>
            <p style={{textAlign: 'center'}}>Reserve um laboratório</p>
          </div>
        </>
      }
    </div>
  )
}