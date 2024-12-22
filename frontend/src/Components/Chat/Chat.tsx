import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import './Chat.css';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<{ username: string, message: string, channel: string }[]>([]);
    const [totalClicks, setTotalClicks] = useState<number>(0);
    
    useEffect(() => {
        const socket = io('http://localhost:5000');
        
        socket.on('chat-message', (message:{ username: string, message: string, channel: string }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('total-clicks', (data: { totalClicks: number }) => {
            setTotalClicks(data.totalClicks);
        });
        
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="chat-wrapper">
            <h1>Chat total clicks: {totalClicks}</h1>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>
                        <strong>{message.username}</strong>: {message.message}
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default Chat;