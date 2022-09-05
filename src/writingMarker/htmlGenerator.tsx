import * as React from "react"
import {renderToStaticMarkup} from 'react-dom/server'
import {TaggedSentence} from "./common";
const stc = require('string-to-color');
var md = require('markdown-it')()
    .use(require('markdown-it-mark'));

function renderHtml(items) {
    return <div className="tagged-sentences">
        <ul className="list-group">
            {
                items.map(item =>
                    <li class="list-group-item" onclick={() => taggedSentenceClicked(`${item.noteId}-${item.index}`)}>
                        <span dangerouslySetInnerHTML={{__html: md.renderInline(item.text)}}>
                        </span>
                        <div className="tagged-sentence-info">
                            <div className="tagged-sentence-note-title">
                                <span className="badge rounded-pill text-bg-light">{item.noteTitle}</span>
                            </div>
                            <div className="tag-badge">
                                {
                                    item.tags.map(tag => <span className="badge rounded-pill"
                                                               style={{"background-color": stc(tag)}}>{tag}</span>)
                                }
                            </div>
                        </div>
                    </li>
                )
            }
        </ul>
    </div>
}

export async function panelHtml(items: TaggedSentence[]) {
    return renderToStaticMarkup(renderHtml(items));
}
