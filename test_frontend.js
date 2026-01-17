
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/projects');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body starts with <:', text.trim().startsWith('<'));
    console.log('Body includes DOCTYPE:', text.includes('DOCTYPE'));
  } catch (e) {
    console.error(e);
  }
}
test();

