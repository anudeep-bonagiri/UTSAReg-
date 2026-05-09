/**
 * Content script — thin stub.
 *
 * Live ASAP harvester (Banner-9-aware, JSON-API based) lands once a real
 * ASAP capture is provided. Until then this just logs that it ran so we
 * can verify the manifest content_scripts registration is healthy.
 *
 * Critical: content scripts in MV3 cannot use ES module imports across
 * files. Anything referenced here must be inlined by the bundler. Keeping
 * the file dependency-free is the simplest way to honor that.
 */

if (typeof window !== 'undefined') {
    console.info('[utsa-reg+] content script ready');
}
