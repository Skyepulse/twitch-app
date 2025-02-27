import React, { useEffect, useState } from "react";
import TCline from "./TCline/TCline";
import "./TopClickers.css";

interface TopClicksProps {
    topClickers: { position: number; user_id: number; username: string; click_count: number }[];
}

const MaxTopN: number = 3; // Number of rows shown at a time
const rotationInterval: number = 5000; // Rotation time in milliseconds (e.g., 5000ms = 5s)

const TopClickers: React.FC<TopClicksProps> = ({ topClickers }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [currentList, setCurrentList] = useState(topClickers);

    useEffect(() => {
        if (topClickers.length === 0) return;

        // Preserve rotation state: Find the last shown user in the new list
        const lastUser = currentList[startIndex]?.user_id;
        const newStartIndex = lastUser
            ? Math.max(0, topClickers.findIndex(user => user.user_id === lastUser))
            : 0;

        setCurrentList(topClickers);
        setStartIndex(newStartIndex);
    }, [topClickers]); // Update only when topClickers list changes

    useEffect(() => {
        if (topClickers.length <= MaxTopN) return; // No need to rotate if the list is small

        const interval = setInterval(() => {
            setStartIndex(prevIndex => (prevIndex + MaxTopN) % topClickers.length);
        }, rotationInterval);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [topClickers.length]); // Re-run if the list size changes

    return (
        <div className="top-clickers-wrapper">
            <h1>Best Contributors:</h1>
            {topClickers.length > 0 ? (
                <ul>
                    {topClickers.slice(startIndex, startIndex + MaxTopN).map(tc => (
                        <TCline key={tc.user_id} position={tc.position} username={tc.username} click_count={tc.click_count} />
                    ))}
                </ul>
            ) : (
                <p>No registered clicks right now!</p>
            )}
        </div>
    );
};

export default TopClickers;
