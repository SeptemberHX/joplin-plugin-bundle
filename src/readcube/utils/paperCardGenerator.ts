import {PaperItem} from "../lib/papers/papersLib";

export const colorMap = {
    1: '#ffd638',
    2: '#94ed96',
    3: '#feb6c1',
    4: '#dba1da',
    5: '#fe0013',
    6: '#001df8',
    7: '#000000',
    8: '#137f1a',
    9: '#7e087d',
    10: '#ffa42c'
};


export function buildPaperCard(item: PaperItem, options) {
    if (item) {
        let stars = '☆☆☆☆☆';
        switch (item.rating) {
            case 1:
                stars = '★☆☆☆☆';
                break;
            case 2:
                stars = '★★☆☆☆';
                break;
            case 3:
                stars = '★★★☆☆';
                break;
            case 4:
                stars = '★★★★☆';
                break;
            case 5:
                stars = '★★★★★';
                break;
            default:
                break;
        }

        return `<table class="paper_tg">
<thead>
  <tr>
    <th class="paper_tg_title" colspan="4"><a href="https://www.readcube.com/library/${item.collection_id}:${item.id}">${item.title}</a></th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="paper_tg_authors" colspan="4">${item.authors.join(', ')}</td>
  </tr>
  <tr>
    <td class="paper_tg_from"><i>${item.journal}</i></td>
    <td class="paper_tg_year">${item.year}</td>
    <td class="paper_tg_tags">${item.tags.length > 0 ? item.tags : 'No tags'}</td>
    <td class="paper_tg_stars">${stars}</td>
  </tr>
  <tr>
    <td class="paper_tg_abstract" colspan="4">${item.abstract}</td>
  </tr>
  <tr>
    <td class="paper_tg_notes" colspan="4"><b>User Notes:</b><br/>${item.notes}</td>
  </tr>
</tbody>
</table>
`
    } else {
        return `<div style="color: red;">Paper does not exist.<br>Please check your paper id.</div>`
    }
}
