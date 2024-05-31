/* Packages */
import { PiCheckCircle } from "react-icons/pi";
import { PiWarningCircleLight } from "react-icons/pi";
import { PiXCircle } from "react-icons/pi";
import { motion } from "framer-motion";

/* Css */
import './Alert.css'

export default function Alert({messageType, message}) {
    let messageIcon;
    let style;
    if(messageType === 'Success') {
        messageIcon = <PiCheckCircle className="Icon" style={{color: '#15a249'}} />
        style={color: '#15a249', border: 'solid #15a249 1px'}
    }
    else if(messageType === 'Warning') {
        messageIcon = <PiWarningCircleLight className="Icon" style={{color: '#c98903'}} />
        style={color: '#c98903', border: 'solid #c98903 2px'}
    }
    else if (messageType === 'Error') {
        messageIcon = <PiXCircle className="Icon" style={{color: '#db2525'}} />
        style={color: '#db2525', border: 'solid #db2525 1px'}
    }

    return (
        <div className='AlertWrapper flex h'>
            <motion.div initial={{scale: 0, borderRadius: '70px'}} animate={{scale: 1, borderRadius: '10px'}} exit={{scale: 0, borderRadius: '70px'}} className='Alert flex h v' style={style}>
                {messageIcon}
                <p>{message}</p>
            </motion.div>
        </div>
    )
}