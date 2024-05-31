/* Css */
import './MainInfo.css'

export default function MainInfo({name, value}) {
  return (
    <div className='flex v c MainInfo'>
        <h3>{name}</h3>
        <p>{value}</p>
    </div>
  )
}