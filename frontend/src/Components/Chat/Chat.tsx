import React, { useEffect, useState } from "react";
import './Chat.css';

interface ChatProps {
    messages: { username: string, message: string, channel: string }[];
}

const Chat: React.FC<ChatProps> = ({messages}) => {
    return (
        <div className="chat-wrapper">
            <h1>Chat Messages</h1>
            <div className="chat-box">
                {messages.slice(-15).map((message, index) => (
                    <div key={index} className="message">
                        <strong>{message.username}</strong>: {message.message}
                    </div>
                ))}
            </div>
        </div>
    )
};

export default Chat;