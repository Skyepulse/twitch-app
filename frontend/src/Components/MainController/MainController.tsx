import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Chat from '../Chat/Chat';
import ClickCounter, { ClickCounterRef } from '../ClickCounter/ClickCounter';
import TopClikers from "../Top Clickers/TopClickers";
import AnimatedClick, {getRandomPosition} from "../AnimatedClick/AnimatedClick";
import './MainController.css';
import { createRoot } from "react-dom/client";

//================================//
const MainController: React.FC = () => {
    //------------Members-------------//
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
    const [messages, setMessages] = useState<{ username: string, message: string, channel: string }[]>([]);
    const [clicks, setClicks] = useState<number>(0);
    const [topClickers, setTopClickers] = useState<{ position: number, user_id: number, username: string, click_count: number }[]>([]);
    const middleContainerRef = useRef<HTMLDivElement>(null);
    const clickCounterRef = useRef<ClickCounterRef>(null);

    //------------UseEffects-------------//
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        //------------Handle Messages-------------//
        newSocket.on('chat-message', (message:{ username: string, message: string, channel: string }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on('top-clickers', (data: { topClickers: { position: number, user_id: number, username: string, click_count: number }[] }) => {
            setTopClickers(data.topClickers);
        });
        
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            const handleTotalClicks = (data: { totalClicks: number }) => {
                if (clicks !== data.totalClicks) {
                    setClicks(data.totalClicks);
                    AnimateClick(middleContainerRef.current, data.totalClicks - clicks);

                    if (clickCounterRef.current) {
                        clickCounterRef.current.updateScore();
                    }
                }
            };

            socket.on('total-clicks', handleTotalClicks);

            return () => {
                socket.off('total-clicks', handleTotalClicks);
            };
        }
    }, [socket, clicks]);

    //------------Structure-------------//
    return (
        <div className="main-controller-wrapper">
            <div className="main-controller-header">
                <TopClikers topClickers = {topClickers}/>
            </div>
            <div ref={middleContainerRef} className="main-controller-body">
                <ClickCounter ref={clickCounterRef} clicks = {clicks}/>
            </div>
            <div className="main-controller-footer">
                <Chat messages = {messages}/>
            </div>
        </div>
    )
};

//================================//
const AnimateClick = (container: HTMLElement | null, clicks: number) => {
    if (!container) return;

    const popupContainer = document.createElement('div');
    let coordinates = getRandomPosition(container);
    popupContainer.className = 'animated-click';
    popupContainer.setAttribute('style', `top: ${coordinates.y}px; left: ${coordinates.x}px;`);
    container.appendChild(popupContainer);

    const root = createRoot(popupContainer);
    root.render(<AnimatedClick clicks={clicks}/>);
    
    setTimeout(() => {
        root.unmount();
        popupContainer.remove();
    }, 1000); 
};

export default MainController;