import React, { useEffect, useState } from "react";
import TCline from "./TCline/TCline";
import './TopClickers.css';

interface TopClicksProps {
    topClickers: { position: number, user_id: number, username: string, click_count: number }[];
}

const TopClikers: React.FC<TopClicksProps> = ({topClickers}) => {
    return (
        <div className="top-clickers-wrapper">
            <h1>Best Constributors: </h1>
            {topClickers.length > 0 ? (
                <ul>
                    {topClickers.map((tc, index) => (
                        <TCline key = {index} position={tc.position} username={tc.username} click_count={tc.click_count}/>
                    ))}
                </ul>
            ) : (
                <p>No registered clicks right now!</p>
            )}
        </div>
    )
};

export default TopClikers;