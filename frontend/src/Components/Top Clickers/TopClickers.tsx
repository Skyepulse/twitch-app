import React, { useEffect, useState } from "react";
import './TopClickers.css';

interface TopClicksProps {
    topClickers: { user_id: number, username: string, click_count: number }[];
}

const TopClikers: React.FC<TopClicksProps> = ({topClickers}) => {
    return (
        <div className="top-clickers-wrapper">
            <h1>Best Constributors: </h1>
            {topClickers.length > 0 ? (
                <ul>
                    {topClickers[0] && (
                        <li>
                            <span color="golden">Top 1: {topClickers[0].username} - {topClickers[0].click_count} clicks</span>
                        </li>
                    )}
                    {topClickers[1] && (
                        <li>
                            <span>Top 2: {topClickers[1].username} - {topClickers[1].click_count} clicks</span>
                        </li>
                    )}
                    {topClickers[2] && (
                        <li>
                            <span>Top 3: {topClickers[2].username} - {topClickers[2].click_count} clicks</span>
                        </li>
                    )}
                </ul>
            ) : (
                <p>No registered clicks right now!</p>
            )}
        </div>
    )
};

export default TopClikers;