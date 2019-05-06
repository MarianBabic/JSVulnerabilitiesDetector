function confirmForm(event) {
    if (event.keyCode === 13) { // 13 is Enter key

        // this is a string
        const input = document.getElementById('input').value;

        const newTab = window.open('', '_blank', 'height=300, width=500');

        newTab.document.write(input);
    }
}
