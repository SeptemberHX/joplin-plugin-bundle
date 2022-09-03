function taggedSentenceClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_tagged_sentence_clicked',
        id: id
    });
}
