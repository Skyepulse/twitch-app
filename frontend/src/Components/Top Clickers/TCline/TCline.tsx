import './TCline.css';
import React from 'react';

interface TClineProps {
    username: string;
    click_count: number;
    position: number;
}

const TCline: React.FC<TClineProps> = ({username, click_count, position}) => {

    let mycolor = 'black';
    switch(position){
        case 1:
            mycolor = 'gold';
            break;
        case 2:
            mycolor = 'silver';
            break;
        case 3:
            mycolor = '#cd7f32'; // bronze
            break;
        default:
            mycolor = 'black';
            break;
    }
    return (
        <li className="tc-line">
            <span style={{ color: mycolor }}>Top {position}: {username} - {click_count} clicks</span>
        </li>
    )
};

export default TCline;