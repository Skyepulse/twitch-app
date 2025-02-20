import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Socket } from "socket.io-client/build/esm/socket";
import Chat from '../Chat/Chat';
import ClickCounter, { ClickCounterRef } from '../ClickCounter/ClickCounter';
import TopClikers from "../Top Clickers/TopClickers";
import AnimatedClick, {getRandomPosition} from "../AnimatedClick/AnimatedClick";
import './MainController.css';
import { createRoot } from "react-dom/client";

//================================//
const MainController: React.FC = () => {
    //------------Members-------------//
    const socketRef = useRef<SocketIOClient.Socket | null>(null);
    const [messages, setMessages] = useState<{ username: string, message: string, channel: string }[]>([]);
    const [clicks, setClicks] = useState<number>(0);
    const [topClickers, setTopClickers] = useState<{ position: number, user_id: number, username: string, click_count: number }[]>([]);
    const middleContainerRef = useRef<HTMLDivElement>(null);
    const clickCounterRef = useRef<ClickCounterRef>(null);

    //------------UseEffects-------------//
    useEffect(() => {
        const url = ('ws://' + process.env.REACT_APP_BACKEND_LB + ":" + process.env.REACT_APP_BACKEND_PORT) || 'https://localhost:5000';
        console.log("Connecting to:", url);

        if (!socketRef.current) {
            socketRef.current = io(url, {
                transports: ["websocket", "polling"], // Ensure different transport options
                reconnectionAttempts: 5,  // Retry 5 times before failing
                timeout: 5000, // 5 seconds timeout
                secure: true, // Use secure connection
            });

            socketRef.current.on("connect", () => {
                console.log("✅ WebSocket Connected:", socketRef.current?.id);
            });
    
            socketRef.current.on("connect_error", (error: Error) => {
                console.error("❌ Connection Error:", error.message);
            });
    
            socketRef.current.on("disconnect", (reason: Socket.DisconnectReason) => {
                console.warn("⚠️ Disconnected:", reason);
            });
    
            socketRef.current.on("reconnect_attempt", (attempt: number) => {
                console.warn(`🔁 Reconnect Attempt #${attempt}`);
            });
    
            socketRef.current.on("reconnect_failed", () => {
                console.error("❌ WebSocket Reconnection Failed.");
            });
    
            socketRef.current.on('chat-message', (message: { username: string, message: string, channel: string }) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });
    
            socketRef.current.on('top-clickers', (data: { topClickers: { position: number, user_id: number, username: string, click_count: number }[] }) => {
                setTopClickers(data.topClickers);
            });
        }
        
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        const handleTotalClicks = (data: { totalClicks: number }) => {
            if (clicks !== data.totalClicks) {
                setClicks(data.totalClicks);
                AnimateClick(middleContainerRef.current, data.totalClicks - clicks);

                if (clickCounterRef.current) {
                    clickCounterRef.current.updateScore();
                }
            }
        };

        socketRef.current.on('total-clicks', handleTotalClicks);

        return () => {
            socketRef.current?.off('total-clicks', handleTotalClicks);
        };
    }, [clicks]);

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