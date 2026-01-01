
import "./tests/test_setup.ts";

try {
    console.log("Checking document...");
    if (typeof document !== 'undefined') {
        console.log("Document is defined");
        const el = document.getElementById('battle-map');
        console.log("Element:", el);
    } else {
        console.error("Document is NOT defined");
    }

    const { TacticalMap } = await import("./app.js");
    console.log("Imported TacticalMap");
    const map = new TacticalMap(10, 10);
    console.log("Created map");
} catch (e) {
    console.error("CAUGHT ERROR:", e);
}
