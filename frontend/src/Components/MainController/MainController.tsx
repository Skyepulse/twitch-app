import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Chat from '../Chat/Chat';
import ClickCounter from '../ClickCounter/ClickCounter';
import TopClikers from "../Top Clickers/TopClickers";
import './MainController.css';

//================================//
const MainController: React.FC = () => {
    //------------Members-------------//
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
    const [messages, setMessages] = useState<{ username: string, message: string, channel: string }[]>([]);
    const [clicks, setClicks] = useState<number>(0);
    const [topClickers, setTopClickers] = useState<{ user_id: number, username: string, click_count: number }[]>([]);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        //------------Handle Messages-------------//
        newSocket.on('chat-message', (message:{ username: string, message: string, channel: string }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on('total-clicks', (data: { totalClicks: number }) => {
            setClicks(data.totalClicks);
        });

        newSocket.on('top-clickers', (data: { topClickers: { user_id: number, username: string, click_count: number }[] }) => {
            setTopClickers(data.topClickers);
        });
        
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="main-controller-wrapper">
            <div className="main-controller-header">
                <TopClikers topClickers = {topClickers}/>
            </div>
            <div className="main-controller-body">
                <ClickCounter clicks = {clicks}/>
            </div>
            <div className="main-controller-footer">
                <Chat messages = {messages}/>
            </div>
        </div>
    )
};

//================================//


export default MainController;