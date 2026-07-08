export async function testBackend() {
  const response = await fetch("http://localhost:5000/api/test");

  return response.json();
}