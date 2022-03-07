import React, { useEffect, useState, useRef } from 'react'

// Styles
import styles from "../styles/live.module.scss";
function DisapperingImage(props) {

    const [time, setTime] = useState(30);
    const imgRef = useRef(null);

    useEffect(() => {
        imgRef.current = document.querySelector(`#ss-${props.index}`);
        imgRef.current.dataset.watermark = (props.state.myInfo.ipInfo.ip + " ").repeat(props.state.isMobileView? 10 : 20);
    }, [])

    useEffect(() => {
        console.log(imgRef);
        if (time === 0){
            if (imgRef.current)
            imgRef.current.style.filter = "blur(3px)";
        }else {
            setTimeout(() => {
                setTime(time - 1)
            }, 1000);
        }
    }, [time])

  return (
    <div
        style={{ animation: props.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
        className={props.msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
    >
        <div className={styles.chatContainer__receivedMsg}>
            <div className={styles.chatContainer__receivedMsg}>
                <div className="watermarked" data-watermark="" id={`ss-${props.index}`}>
                    <img src={props.msg.msg} id={`ss-${props.index}`} />
                </div>
            </div>
        </div>
        <div className={styles.chatContainer__receivedMsgName}>
            <b>{props.senderName}</b> <br/> {props.timeStamp}
             { time > 0 && `Image disappers in ${time} secs`}
             { time == 0 && `Image disappered`}
        </div>
    </div>
  )
}

export default DisapperingImage