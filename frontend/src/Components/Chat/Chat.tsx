import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<{ username: string, message: string, channel: string }[]>([]);
    
    useEffect(() => {
        const socket = io('http://localhost:5000');
        
        socket.on('chat-message', (message:{ username: string, message: string, channel: string }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Chat</h1>
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