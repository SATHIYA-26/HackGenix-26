async function test() {
  const res = await fetch('http://localhost:3000/dashboard');
  const html = await res.text();
  const cssMatches = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+)"/g)];
  console.log("Found CSS links:", cssMatches.length);
  for (const m of cssMatches) {
    const cssRes = await fetch('http://localhost:3000' + m[1]);
    const cssText = await cssRes.text();
    console.log("CSS file:", m[1], "size:", cssText.length);
    console.log("Contains 'flex':", cssText.includes(".flex"));
    console.log("Contains 'h-screen':", cssText.includes(".h-screen"));
    console.log("Contains 'w-[240px]':", cssText.includes("w-[240px]") || cssText.includes("240px"));
    console.log("Contains 'bg-[#FBF9F5]':", cssText.includes("FBF9F5"));
  }
}
test();
