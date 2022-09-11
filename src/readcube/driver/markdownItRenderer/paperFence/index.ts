import {PAPER_ID_REG} from "../../../utils/reg";

export default function (context) {
    return {
        plugin: function (markdownIt, _options) {
            const pluginId = context.pluginId;

            const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options, env, self);
            };

            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx];
                console.log(token);
                if (token.info !== 'paper') return defaultRender(tokens, idx, options, env, self);

                const idMatch = PAPER_ID_REG.exec(token.content);
                if (idMatch) {
                    return `
                        <div class="paperRender">${idMatch[1]}</div>
                    `;
                } else {
                    return defaultRender(tokens, idx, options, env, self);
                }
            };
        },
        assets: function () {
            return [
                {name: 'paperFence.css'},
                {name: 'paperRender.js'}
            ];
        },
    }
}
