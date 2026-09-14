// Typst WASM compiler integration
// Requires typst_ts_web_compiler_bg.wasm and typst_ts_renderer_bg.wasm in /static/
// These can be obtained from the @myriaddreamin/typst.ts npm package

let typstInstance: any = null;
let initPromise: Promise<void> | null = null;

export async function initCompiler(): Promise<void> {
  if (typstInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { $typst } = await import("@myriaddreamin/typst.ts");
      typstInstance = $typst;

      $typst.setCompilerInitOptions({
        getModule: () =>
          fetch("/typst_ts_web_compiler_bg.wasm").then((r) => r.arrayBuffer()),
      });
      $typst.setRendererInitOptions({
        getModule: () =>
          fetch("/typst_ts_renderer_bg.wasm").then((r) => r.arrayBuffer()),
      });

      // Warm-up compile
      await $typst.svg({
        mainContent: "#set page(width: 10pt, height: 10pt)\n ",
      });
    } catch (e) {
      console.warn(
        "Typst WASM initialization failed. Preview will use HTML rendering.",
        e,
      );
      typstInstance = null;
    }
  })();

  return initPromise;
}

export async function compileToSvg(
  typstCode: string,
  imageData?: Uint8Array,
): Promise<string | null> {
  if (!typstInstance) return null;
  try {
    if (imageData) {
      typstInstance.mapShadow("/photo.jpg", imageData);
    }
    const svg = await typstInstance.svg({ mainContent: typstCode });
    return svg;
  } catch (e) {
    console.error("Typst compilation error:", e);
    return null;
  }
}

export function isCompilerAvailable(): boolean {
  return typstInstance !== null;
}
