// TODO
function test1() {
    return `<script>alert('test');</script>`
}

function test2() {
    return `<script>
    console.log('test')
    </script>` // TODO
}

const input;

// es marks it as eval function even without proper parenthesis
eval, eval()

eval(function () { });
_eval(input);

let divEl = new HTMLElement();

divEl.innerHTML = '<div>text</div>';
divEl.innerHTML = input;

divEl.outerHTML = '<div>text</div>';
divEl.outerHTML = input;

document.write(input);
document.writeln(input);

eval()