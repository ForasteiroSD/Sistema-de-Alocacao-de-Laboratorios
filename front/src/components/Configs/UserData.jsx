/* Css */
import './UserData.css'

export default function UserData({icon, title, data}) {
  return (
    <div className='flex v UserData'>
        <div className='IconDiv flex v h'>
            {icon}
        </div>
        <div className='DataDiv flex c'>
            <p className='Title'>{title}</p>
            <p className='Data'>{data}</p>
        </div>
    </div>
  )
}