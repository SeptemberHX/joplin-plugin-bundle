import * as React from "react"
import {renderToStaticMarkup} from 'react-dom/server'

export function underDevelopment() {
    return renderToStaticMarkup(
        <div className="card">
            <div className="card-body">Under development...</div>
        </div>
    );
}
