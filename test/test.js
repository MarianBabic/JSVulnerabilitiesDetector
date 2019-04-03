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

eval(function () { });
eval(input);

let divEl = new HTMLElement();

divEl.innerHTML = '<div>text</div>';
divEl.innerHTML = input;

divEl.outerHTML = '<div>text</div>';
divEl.outerHTML = input;

document.write(input);
document.writeln(input); divEl.innerHTML = '<div>text</div>';
divEl.innerHTML = input;

divEl.outerHTML = '<div>text</div>';
divEl.outerHTML = input;

alert('test');
alert("test");

console.log('test');
console.log("test");
