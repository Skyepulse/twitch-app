import React, { useEffect, useState } from "react";
import './Chat.css';

interface ChatProps {
    messages: { username: string, message: string, channel: string }[];
}

const Chat: React.FC<ChatProps> = ({messages}) => {
    return (
        <div className="chat-wrapper">
            <h1>Chat Messages</h1>
            <ul>
                {messages.slice(-3).map((message, index) => (
                    <li key={index}>
                        <strong>{message.username}</strong>: {message.message}
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default Chat;