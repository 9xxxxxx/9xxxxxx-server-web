
async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/projects');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body start:', text.substring(0, 100));
    try {
        JSON.parse(text);
        console.log('JSON Valid');
    } catch(e) {
        console.log('JSON Invalid');
    }
  } catch (e) {
    console.error(e);
  }
}
test();

