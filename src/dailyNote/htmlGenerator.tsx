import * as React from "react"
import {renderToString} from 'react-dom/server'
import {DailyNoteConfig} from "./settings";


export function cellInnerHtml(monthClass: string, hasNote: boolean, isToday: boolean, date, finishedTaskCount?: number, config?: DailyNoteConfig, wordCount?: number) {
    return renderToString(generateCell(monthClass, hasNote, isToday, date, finishedTaskCount, config, wordCount));
}


function generateCell(monthClass: string, hasNote: boolean, isToday: boolean, date, finishedTaskCount?: number, config?: DailyNoteConfig, wordCount?: number) {
    let wordCountLevel = wordCount ? Math.ceil(wordCount / (config && config.wordStep > 0 ? config.wordStep : 100)) : 0;
    if (wordCountLevel >= 20) {
        wordCountLevel = 20;
    }

    function generateWordCountPoint(level) {
        const result = [];
        for (let i = 1; i * 5 <= level; ++i) {
            result.push(<svg className="dot filled level-5" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3" r="2"></circle>
            </svg>);
        }

        for (let i = 1; i <= level % 5; ++i) {
            result.push(<svg className="dot filled level-1" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3" r="2"></circle>
            </svg>);
        }
        return result;
    }

    return <div class={generateClass(hasNote, isToday, finishedTaskCount)} style={generateStyle(finishedTaskCount, config)}>
            <div class="day-number">
                {date.date()}
            </div>
            <div className="dot-container">
                {generateWordCountPoint(wordCountLevel)}
            </div>
        </div>
}

function generateClass(hasNote, isToday, finishedTaskCount) {
    return `day ${hasNote ? 'hasNote' : 'noNote'} ${isToday ? 'curr-day' : ''} ${finishedTaskCount && finishedTaskCount >= 10 ? 'level-10' : 'level-' + finishedTaskCount}`;
}

function generateStyle(finishedTaskCount, config: DailyNoteConfig) {
    const style = {};
    if (finishedTaskCount && config.enableHeatmap) {
        style['background-color'] = `rgba(${config.heatmapColor}, 0.${Math.ceil(finishedTaskCount / (config.step > 0 ? config.step : 1))})`;
    }
    return style;
}
