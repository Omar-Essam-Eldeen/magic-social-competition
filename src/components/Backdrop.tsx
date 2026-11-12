/**
 * The fixed cinematic backdrop: a gradient-mesh layer with three
 * slow-drifting orbs, plus a vignette that darkens the screen edges.
 * Rendered once, outside the routed content. Pure decoration.
 */
export function Backdrop() {
  return (
    <>
      <div className="glass-backdrop" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="glass-vignette" aria-hidden="true" />
    </>
  );
}
